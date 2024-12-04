import type { H3Event } from 'h3'
import { useOctokit } from '~~/server/utils/github'

interface RateLimitInfo {
  remaining: number
  reset: number
  limit: number
}

/**
 * Checks GitHub API rate limit status and throws error if close to limit
 * @param _event - H3 event object
 * @returns Current rate limit information
 * @throws {Error} When rate limit is nearly exceeded (< 10 remaining calls)
 */
export async function checkRateLimit(_event: H3Event): Promise<RateLimitInfo> {
  try {
    const octokit = useOctokit()
    const { data: rateLimit } = await octokit.request('GET /rate_limit')

    const remaining = rateLimit.resources.core.remaining
    const resetTime = new Date(rateLimit.resources.core.reset * 1000)

    if (remaining < 10) {
      throw createError({
        statusCode: 429,
        message: `Rate limit low (${remaining} remaining). Resets at ${resetTime.toISOString()}`,
      })
    }

    return {
      remaining: remaining,
      reset: rateLimit.resources.core.reset,
      limit: rateLimit.resources.core.limit,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to check rate limit. Please try again later.',
      cause: error,
    })
  }
}
