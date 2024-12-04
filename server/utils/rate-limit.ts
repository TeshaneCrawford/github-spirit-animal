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
  const octokit = useOctokit()
  const { data: rateLimit } = await octokit.request('GET /rate_limit')

  if (rateLimit.resources.core.remaining < 10) {
    throw createError({
      statusCode: 429,
      message: `Rate limit nearly exceeded. Resets at ${new Date(rateLimit.resources.core.reset * 1000).toISOString()}`,
    })
  }

  return {
    remaining: rateLimit.resources.core.remaining,
    reset: rateLimit.resources.core.reset,
    limit: rateLimit.resources.core.limit,
  }
}
