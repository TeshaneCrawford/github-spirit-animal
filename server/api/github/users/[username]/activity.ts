import type { ActivityStats, UserActivity, DailyActivity, GitHubEvent, GitHubError, ActivityTrends, CodeQualityMetrics, EngagementMetrics } from '~~/types/github'
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
    const date = event.created_at ? new Date(event.created_at) : null
    if (!date) return acc

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

  const maxActivityDayIndex = activityByDay.indexOf(Math.max(...activityByDay))
  const maxActivityHourIndex = activityByHour.indexOf(Math.max(...activityByHour))

  return {
    dailyAverage: activities.length / 7,
    weeklyGrowth: calculateWeeklyGrowthRate(activities),
    mostActiveDay: DAYS[maxActivityDayIndex] || 'Sunday', // Ensure string type with fallback
    mostActiveTime: `${maxActivityHourIndex}:00`,
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
 * Activity Stats API
 * Returns user's contribution patterns, code quality metrics,
 * and engagement statistics with 10m cache
 */
export default defineEventHandler(async (event): Promise<EnhancedActivityStats> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  try {
    // Add rate limit check with better error handling
    try {
      await checkRateLimit(event)
    }
    catch (rateLimitError) {
      console.error('Rate limit error:', rateLimitError)
      throw createError({
        statusCode: 429,
        message: 'GitHub API rate limit exceeded. Please try again later.',
      })
    }

    const [stats, activityMetrics] = await Promise.all([
      fetchUserStats(event, username).catch((error) => {
        console.error('Error fetching user stats:', error)
        throw error
      }),
      fetchActivityMetrics(event, username).catch((error) => {
        console.error('Error fetching activity metrics:', error)
        throw error
      }),
    ])

    if (!stats?.activity) {
      console.warn('No activity data found for user:', username)
      // Return empty stats instead of throwing error
      return {
        current: {
          daily: getEmptyActivityMetrics(),
          weekly: getEmptyActivityMetrics(),
          monthly: getEmptyActivityMetrics(),
        },
        heatmap: [],
        codeQuality: getEmptyCodeQuality(),
        engagement: getEmptyEngagement(),
        trends: getEmptyTrends(),
      }
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
    console.error('Activity endpoint error:', error)
    const githubError = error as GitHubError

    // Determine appropriate status code
    const statusCode = githubError.status
      || githubError.response?.status
      || (githubError.message?.includes('rate limit') ? 429 : 500)

    throw createError({
      statusCode,
      message: githubError.message || 'Failed to fetch activity data',
      cause: error, // Add cause for better error tracking
    })
  }
})

// Add helper functions for empty states
function getEmptyActivityMetrics(): UserActivity {
  return {
    commits: 0,
    pullRequests: 0,
    issues: 0,
    comments: 0,
    repositories: 0,
    contributions: 0,
    timestamp: new Date().toISOString(),
  }
}

function getEmptyCodeQuality(): CodeQualityMetrics {
  return {
    averageCommitSize: 0,
    prReviewParticipation: 0,
    issueResolutionRate: 0,
    codeReviewThoroughness: 0,
  }
}

function getEmptyEngagement(): EngagementMetrics {
  return {
    issueDiscussionCount: 0,
    prReviewCount: 0,
    averageCommentsPerIssue: 0,
    averageCommentsPerPR: 0,
  }
}

function getEmptyTrends(): ActivityTrends {
  return {
    dailyAverage: 0,
    weeklyGrowth: 0,
    mostActiveDay: 'Sunday',
    mostActiveTime: '0:00',
  }
}
