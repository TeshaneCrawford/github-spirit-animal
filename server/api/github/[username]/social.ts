import type { TimelineData, GitHubError } from '~~/types/github'
import { fetchUserProfile, useOctokit } from '~~/server/utils/github'

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

        const relevantEvents = events.filter(event =>
          event.type === eventType,
        )

        const timelineData: TimelineData[] = []
        let count = currentCount

        relevantEvents.reverse().forEach((event) => {
          if (!event.created_at) return

          const date = event.created_at.split('T')[0]
          count += event.type === 'FollowEvent' ? 1 : -1

          timelineData.push({
            date,
            count: Math.max(0, count), // Ensure count never goes below 0
          })
        })

        return timelineData
      }
      catch (error) {
        console.error('Failed to fetch historical data:', error)
        return []
      }
    }

    // Fetch both followers and following history
    const followersHistory = await fetchHistoricalData('FollowEvent', userProfile.followers)
    const followingHistory = await fetchHistoricalData('FollowEvent', userProfile.following)

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
