import type { ActivityStats, UserActivity, DailyActivity, GitHubEvent, GitHubError, ActivityTrends } from '~~/types/github'
import { fetchUserStats, fetchActivityMetrics } from '~~/server/utils/github'
import { checkRateLimit } from '~~/server/utils/rate-limit'
import { calculateCodeQuality, calculateEngagement } from '~~/server/utils/metrics'

/**
 * Calculates contribution metrics for a specific time window
 * @param activities Array of GitHub events to analyze
 * @param days Number of days to include in analysis
 */
function calculateActivityMetrics(activities: GitHubEvent[], days: number): UserActivity {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const filteredActivities = activities.filter(event =>
    event.created_at && new Date(event.created_at) >= cutoffDate,
  )

  return {
    commits: filteredActivities.filter(e => e.type === 'PushEvent').length,
    pullRequests: filteredActivities.filter(e => e.type === 'PullRequestEvent').length,
    issues: filteredActivities.filter(e => e.type === 'IssuesEvent').length,
    comments: filteredActivities.filter(e => e.type === 'IssueCommentEvent').length,
    repositories: new Set(filteredActivities.map(e => e.repo.id)).size,
    contributions: filteredActivities.length,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Generates a 2D heatmap of user activity
 * Maps activity intensity across days of week and hours of day
 */
function generateActivityHeatmap(activities: GitHubEvent[]): DailyActivity[] {
  return activities.reduce((acc: DailyActivity[], event) => {
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
}

/**
 * Analyzes user's contribution patterns and timing
 * Used to identify peak activity periods and work habits
 */
function calculateActivityTrends(activities: GitHubEvent[]): ActivityTrends {
  const activityByDay = new Array(7).fill(0)
  const activityByHour = new Array(24).fill(0)

  activities.forEach((event) => {
    if (!event.created_at) return
    const date = new Date(event.created_at)
    activityByDay[date.getDay()]++
    activityByHour[date.getHours()]++
  })

  return {
    dailyAverage: activities.length / 7,
    weeklyGrowth: calculateWeeklyGrowthRate(activities),
    mostActiveDay: DAYS[activityByDay.indexOf(Math.max(...activityByDay))],
    mostActiveTime: `${activityByHour.indexOf(Math.max(...activityByHour))}:00`,
  }
}

/**
 * Measures activity growth by comparing recent vs previous week
 * Returns percentage change in activity level
 */
function calculateWeeklyGrowthRate(activities: GitHubEvent[]): number {
  const thisWeek = activities.filter(e =>
    e.created_at && new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length
  const lastWeek = activities.filter(e =>
    e.created_at
    && new Date(e.created_at) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    && new Date(e.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  return lastWeek ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface EnhancedActivityStats extends ActivityStats {
  trends: {
    dailyAverage: number
    weeklyGrowth: number
    mostActiveDay: string
    mostActiveTime: string
  }
}

/**
 * Activity Stats Endpoint
 * Provides comprehensive activity analysis including:
 * - Daily/weekly/monthly metrics
 * - Activity heatmap
 * - Code quality metrics
 * - Engagement statistics
 */
export default defineEventHandler(async (event): Promise<EnhancedActivityStats> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  // Add rate limit check
  await checkRateLimit(event)

  try {
    const [stats, activityMetrics] = await Promise.all([
      fetchUserStats(event, username),
      fetchActivityMetrics(event, username),
    ])

    if (!stats || !activityMetrics || !activityMetrics.commitPatterns) {
      throw createError({
        statusCode: 404,
        message: 'Incomplete activity data found for this user',
      })
    }

    const allActivities = [
      ...activityMetrics.commitPatterns,
      ...activityMetrics.prActivity,
      ...activityMetrics.issueActivity,
    ]

    const baseStats = {
      current: {
        daily: calculateActivityMetrics(allActivities, 1),
        weekly: calculateActivityMetrics(allActivities, 7),
        monthly: calculateActivityMetrics(allActivities, 30),
      },
      heatmap: generateActivityHeatmap(allActivities),
    }

    const trends = calculateActivityTrends(allActivities)

    // Calculate enhanced metrics
    const [codeQuality, engagement] = await Promise.all([
      calculateCodeQuality(stats.activity),
      calculateEngagement(stats.activity),
    ])

    return {
      ...baseStats,
      trends,
      codeQuality,
      engagement,
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
