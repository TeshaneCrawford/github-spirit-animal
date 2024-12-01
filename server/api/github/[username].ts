import type { UserProfile, UserActivity, DailyActivity, GitHubEvent, GitHubError } from '~~/types/github'
import { fetchUserProfile, fetchUserStats } from '~~/server/utils/github'
import { analyzeGitHubSpirit } from '~~/server/utils/animal-analyser'

/**
 * Main API route that provides comprehensive GitHub user analysis including:
 * - Basic profile information
 * - Activity metrics across different time periods
 * - Spirit animal analysis based on activity patterns
 * - Activity heatmap data
 * - Social metrics history
 */
export default defineEventHandler(async (event): Promise<UserProfile> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  try {
    const user = await fetchUserProfile(event, username)
    const stats = await fetchUserStats(event, username)

    if (!stats || !stats.activity) {
      throw createError({
        statusCode: 404,
        message: 'No activity data found for this user',
      })
    }

    // Calculate activity metrics
    const dailyActivity: UserActivity = {
      commits: stats.activity.filter(e => e.type === 'PushEvent').length,
      pullRequests: stats.activity.filter(e => e.type === 'PullRequestEvent').length,
      issues: stats.activity.filter(e => e.type === 'IssuesEvent').length,
      comments: stats.activity.filter(e => e.type === 'IssueCommentEvent').length,
      repositories: stats.repositories.length,
      contributions: stats.activity.length,
      timestamp: new Date().toISOString(),
    }

    // Generate activity heatmap
    const activityHeatmap: DailyActivity[] = stats.activity.reduce((acc: DailyActivity[], event) => {
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

    // Calculate spirit animal characteristics
    const animalProfile = analyzeGitHubSpirit(dailyActivity, activityHeatmap)

    // Helper function to filter activities by date range
    const filterActivitiesByDateRange = (activities: GitHubEvent[], days: number): UserActivity => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const filteredActivities = activities.filter(event =>
        event.created_at && event.type && new Date(event.created_at) >= cutoffDate,
      )

      return {
        commits: filteredActivities.filter(e => e.type === 'PushEvent').length,
        pullRequests: filteredActivities.filter(e => e.type === 'PullRequestEvent').length,
        issues: filteredActivities.filter(e => e.type === 'IssuesEvent').length,
        comments: filteredActivities.filter(e => e.type === 'IssueCommentEvent').length,
        repositories: stats.repositories.length,
        contributions: filteredActivities.length,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      user,
      activities: {
        daily: filterActivitiesByDateRange(stats.activity, 1),
        weekly: filterActivitiesByDateRange(stats.activity, 7),
        monthly: filterActivitiesByDateRange(stats.activity, 30),
        yearly: filterActivitiesByDateRange(stats.activity, 365),
      },
      animalProfile,
      activityHeatmap,
      followersHistory: [], // Populated via separate social endpoint
      followingHistory: [], // Populated via separate social endpoint
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
