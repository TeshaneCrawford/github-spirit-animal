import type { TimelineData, GitHubError, GitHubEvent } from '~~/types/github'
import { fetchSocialTrends } from '~~/server/utils/github'
import { groupEventsByDay, fillTimelineGaps, TimePeriods } from '~~/utils/datetime'
import { checkRateLimit } from '~~/server/utils/rate-limit'

interface TimelineMetrics {
  currentFollowers: number
  currentFollowing: number
}

// Add this interface to properly type follow events
interface FollowEventPayload {
  action: 'started' | 'stopped'
  target: {
    login: string
    id: number
  }
}

interface GitHubFollowEvent extends GitHubEvent {
  type: 'FollowEvent'
  payload: FollowEventPayload
}

/**
 * Type guard to ensure event has required follow event properties
 * Validates presence of target user and action type
 */
function isFollowEvent(event: GitHubEvent): event is GitHubFollowEvent {
  return event.type === 'FollowEvent'
    && !!event.created_at
    && !!event.payload
    && 'target' in event.payload
    && !!event.payload.target
    && typeof event.payload.target === 'object' && 'login' in event.payload.target
}

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

  await checkRateLimit(event)

  try {
    const socialTrends = await fetchSocialTrends(event, username)

    if (!socialTrends?.events?.length) {
      return {
        followers: [],
        following: [],
      }
    }

    const timeline = processTimelineData(socialTrends.events, {
      currentFollowers: socialTrends.currentStats.followers,
      currentFollowing: socialTrends.currentStats.following,
    })

    // Normalize timeline data to ensure consistent date ranges
    return {
      followers: normalizeTimeline(timeline.followers),
      following: normalizeTimeline(timeline.following),
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

/**
 * Processes GitHub events into daily timeline data
 * - Separates follower and following events
 * - Calculates running totals from current counts
 * - Handles both follow and unfollow actions
 */
function processTimelineData(events: GitHubEvent[], currentStats: TimelineMetrics) {
  const followEvents = events
    .filter(isFollowEvent)
    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

  // Group events by actor (who initiated the follow)
  const followerTimeline = groupEventsByDay(
    followEvents.filter(e => e.payload.target.login === e.actor.login),
    event => event.payload.action === 'started' ? 1 : -1,
  )

  const followingTimeline = groupEventsByDay(
    followEvents.filter(e => e.payload.target.login !== e.actor.login),
    event => event.payload.action === 'started' ? 1 : -1,
  )

  // Adjust timeline data with current stats before filling gaps
  const adjustedFollowers = followerTimeline.map(point => ({
    ...point,
    count: point.count + currentStats.currentFollowers,
  }))

  const adjustedFollowing = followingTimeline.map(point => ({
    ...point,
    count: point.count + currentStats.currentFollowing,
  }))

  return {
    followers: fillTimelineGaps(adjustedFollowers, TimePeriods.MONTH),
    following: fillTimelineGaps(adjustedFollowing, TimePeriods.MONTH),
  }
}

/**
 * Ensures timeline data is complete and properly formatted
 * - Fills gaps in historical data
 * - Maintains chronological order
 * - Ensures non-negative counts
 * - Provides daily granularity for last 30 days
 */
function normalizeTimeline(timeline: TimelineData[]): TimelineData[] {
  if (!timeline.length) return []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Ensure we have at least one data point per day
  const normalizedTimeline = new Array(30).fill(null)
    .map((_, index) => {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + index)
      const dateString = date.toISOString().split('T')[0]
      const existingPoint = timeline.find(p => p.date.startsWith(dateString))
      return {
        date: dateString,
        count: Math.max(0, existingPoint?.count || 0),
      }
    })

  return normalizedTimeline
}
