import type { SpiritAnimalProfile, UserActivity, DailyActivity, GitHubEvent, GitHubError } from '~~/types/github'
import { fetchUserStats } from '~~/server/utils/github'
import { analyzeGitHubSpirit, determineActivityPattern, calculateConsistency } from '~~/server/utils/animal-analyser'
import { checkRateLimit } from '~~/server/utils/rate-limit'

/**
 * Calculates user's current activity metrics from GitHub events
 * Aggregates different types of contributions into a unified activity profile
 */
function calculateCurrentActivity(activity: GitHubEvent[], repoCount: number): UserActivity {
  return {
    commits: activity.filter(e => e.type === 'PushEvent').length,
    pullRequests: activity.filter(e => e.type === 'PullRequestEvent').length,
    issues: activity.filter(e => e.type === 'IssuesEvent').length,
    comments: activity.filter(e => e.type === 'IssueCommentEvent').length,
    repositories: repoCount,
    contributions: activity.length,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Spirit Animal Analysis Endpoint
 * Analyzes GitHub user activity patterns and assigns spirit animals based on:
 * - Activity timing (diurnal/nocturnal patterns)
 * - Contribution consistency
 * - Collaboration patterns
 * - Work style and preferences
 */
export default defineEventHandler(async (event): Promise<SpiritAnimalProfile> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  await checkRateLimit(event)

  try {
    const stats = await fetchUserStats(event, username)

    if (!stats || !stats.activity) {
      throw createError({
        statusCode: 404,
        message: 'No activity data found for this user',
      })
    }

    const currentActivity = calculateCurrentActivity(stats.activity, stats.repositories.length)
    const activityHeatmap = stats.activity.reduce((acc: DailyActivity[], event) => {
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

    const animals = await analyzeGitHubSpirit(currentActivity, activityHeatmap)
    const allTraits = animals.flatMap(a => a.traits)
    const dominantTraits = [...new Set(allTraits)].slice(0, 5)

    return {
      animals,
      dominantTraits,
      activityPattern: determineActivityPattern(activityHeatmap),
      consistency: calculateConsistency(currentActivity),
    }
  }
  catch (error: unknown) {
    const githubError = error as GitHubError
    throw createError({
      statusCode: githubError.status || githubError.response?.status || 500,
      message: githubError.message || 'Failed to fetch user data',
    })
  }
})
