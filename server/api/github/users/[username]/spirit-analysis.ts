/** Spirit animal analysis endpoint - Determines user's GitHub work patterns */

import type { SpiritAnimalProfile, UserActivity, DailyActivity, GitHubEvent, GitHubError } from '~~/types/github'
import { fetchUserStats, fetchActivityMetrics } from '~~/server/utils/github'
import { analyzeGitHubSpirit, determineActivityPattern, calculateConsistency } from '~~/server/utils/animal-analyser'

/** Activity aggregation for behavior analysis */
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

/** Temporal activity mapping for pattern detection */
function generateActivityHeatmap(events: GitHubEvent[]): DailyActivity[] {
  return events.reduce((acc: DailyActivity[], event) => {
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

// Main handler with improved error handling
export default defineEventHandler(async (event): Promise<SpiritAnimalProfile> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  // Validate GitHub token
  const config = useRuntimeConfig()
  if (!config.githubToken) {
    console.error('Missing GitHub token in configuration')
    throw createError({
      statusCode: 401,
      message: 'GitHub authentication not configured',
    })
  }

  try {
    console.log('Starting spirit analysis for:', username)

    const [stats, activityMetrics] = await Promise.all([
      fetchUserStats(event, username).catch((err) => {
        console.error('Stats fetch error:', err)
        return null
      }),
      fetchActivityMetrics(event, username).catch((err) => {
        console.error('Metrics fetch error:', err)
        return null
      }),
    ])

    console.log('Raw stats data:', {
      hasStats: !!stats,
      repoCount: stats?.repositories?.length,
      hasMetrics: !!activityMetrics,
      commitCount: activityMetrics?.commitPatterns?.length,
    })

    console.log('Data fetched - Stats:', !!stats, 'Metrics:', !!activityMetrics)

    // Return default profile for users with no activity
    if (!stats && !activityMetrics) {
      return {
        animals: [],
        dominantTraits: [],
        activityPattern: 'diurnal',
        consistency: 'low',
      }
    }

    const allActivities = [
      ...(activityMetrics?.commitPatterns || []),
      ...(activityMetrics?.prActivity || []),
      ...(activityMetrics?.issueActivity || []),
    ]

    const repoCount = stats?.repositories?.length || 0

    if (allActivities.length === 0) {
      return {
        animals: [],
        dominantTraits: [],
        activityPattern: 'diurnal', // default pattern
        consistency: 'low', // default consistency
      }
    }

    const currentActivity = calculateCurrentActivity(allActivities, repoCount)
    const activityHeatmap = generateActivityHeatmap(allActivities)

    const animals = await analyzeGitHubSpirit(currentActivity, activityHeatmap)
    console.log('Analyzed animals:', animals)

    const allTraits = animals.flatMap(a => a.traits)
    const dominantTraits = [...new Set(allTraits)].slice(0, 5)

    const result = {
      animals,
      dominantTraits,
      activityPattern: determineActivityPattern(activityHeatmap),
      consistency: calculateConsistency(currentActivity),
    }

    console.log('Final result:', result)
    return result
  }
  catch (error: unknown) {
    console.error('Spirit analysis error:', error)
    const githubError = error as GitHubError

    // Improved error handling with specific status codes
    const statusCode = githubError.status
      || githubError.response?.status
      || (githubError.message?.includes('Bad credentials') ? 401 : 500)

    const errorMessage = statusCode === 401
      ? 'GitHub authentication failed'
      : githubError.message || 'Failed to analyze GitHub activity'

    throw createError({
      statusCode,
      message: errorMessage,
      cause: error,
    })
  }
})
