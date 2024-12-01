import type { DailyActivity, UserActivity, GitHubError } from '~~/types/github'
import { fetchUserStats } from '~~/server/utils/github'

/**
 * Dedicated activity endpoint that provides:
 * - Current activity metrics (commits, PRs, issues, etc.)
 * - Activity heatmap data showing patterns across days and hours
 * Used for detailed activity visualization and analysis
 */
export default defineEventHandler(async (event): Promise<{
  current: UserActivity
  heatmap: DailyActivity[]
}> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  try {
    const stats = await fetchUserStats(event, username)

    if (!stats || !stats.activity) {
      throw createError({
        statusCode: 404,
        message: 'No activity data found for this user',
      })
    }

    const currentActivity: UserActivity = {
      commits: stats.activity.filter(e => e.type === 'PushEvent').length,
      pullRequests: stats.activity.filter(e => e.type === 'PullRequestEvent').length,
      issues: stats.activity.filter(e => e.type === 'IssuesEvent').length,
      comments: stats.activity.filter(e => e.type === 'IssueCommentEvent').length,
      repositories: stats.repositories.length,
      contributions: stats.activity.length,
      timestamp: new Date().toISOString(),
    }

    const heatmap: DailyActivity[] = stats.activity.reduce((acc: DailyActivity[], event) => {
      if (!event.created_at) return acc

      const date = new Date(event.created_at)
      const day = date.getDay()
      const hour = date.getHours()
      const existingEntry = acc.find(a => a.day === day && a.hour === hour)

      if (existingEntry) {
        existingEntry.intensity = Math.min(4, existingEntry.intensity + 1)
      }
      else {
        acc.push({ day, hour, intensity: 1 })
      }
      return acc
    }, [])

    return {
      current: currentActivity,
      heatmap,
    }
  }
  catch (error: unknown) {
    const githubError = error as GitHubError
    throw createError({
      statusCode: githubError.status || githubError.response?.status || 500,
      message: githubError.message || 'Failed to fetch activity data',
    })
  }
})
