import type { TimelineData, GitHubError } from '~~/types/github'
import { fetchUserProfile, useOctokit } from '~~/server/utils/github'
import { groupEventsByDay, fillTimelineGaps, TimePeriods } from '~~/utils/datetime'

/**
 * GitHub Social Analytics Endpoint
 *
 * Provides historical data about a user's social network growth:
 * - Tracks follower count changes over time
 * - Analyzes following patterns
 * - Uses GitHub Events API to reconstruct timeline
 *
 * Note: Limited to last 100 events due to GitHub API constraints
 * Future enhancement: Implement data persistence for longer history
 */
export default defineEventHandler(async (event): Promise<{
  followers: TimelineData[]
  following: TimelineData[]
}> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  try {
    const userProfile = await fetchUserProfile(event, username)

    const fetchHistoricalData = async (eventType: 'FollowEvent' | 'UnfollowEvent', currentCount: number) => {
      try {
        const { data: events } = await useOctokit().request('GET /users/{username}/events', {
          username,
          per_page: 100,
        })

        // Filter and process events with running total
        const relevantEvents = events
          .filter(event => event.type === eventType && event.created_at)
          .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

        // Calculate running totals starting from current count
        let runningCount = currentCount
        const timeline = groupEventsByDay(relevantEvents, (event) => {
          runningCount += event.type === 'FollowEvent' ? 1 : -1
          return runningCount
        })

        return fillTimelineGaps(timeline, TimePeriods.MONTH)
      }
      catch (error) {
        console.error('Failed to fetch historical data:', error)
        return []
      }
    }

    // Fetch both histories with proper event types
    const [followersHistory, followingHistory] = await Promise.all([
      fetchHistoricalData('FollowEvent', userProfile.followers),
      fetchHistoricalData('FollowEvent', userProfile.following),
    ])

    return {
      followers: followersHistory,
      following: followingHistory,
    }
  }
  catch (error: unknown) {
    const githubError = error as GitHubError
    throw createError({
      statusCode: githubError.status || githubError.response?.status || 500,
      message: githubError.message || 'Failed to fetch social data',
    })
  }
})
