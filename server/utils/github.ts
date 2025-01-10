/** GitHub API integration layer with caching and error handling */

import type { H3Event } from 'h3'
import { Octokit } from 'octokit'
import type { UserProfileData, GitHubError } from '~~/types/github'

// GitHub API client management
let _octokit: Octokit

const GITHUB_API_BASE = 'https://api.github.com'

/** API client initialization and auth */
export function useOctokit() {
  if (!_octokit) {
    const config = useRuntimeConfig()
    if (!config.githubToken) {
      throw createError({
        statusCode: 401,
        message: 'GitHub token is not configured',
      })
    }
    _octokit = new Octokit({
      auth: config.githubToken,
    })
  }
  return _octokit
}

/**
 * Fetches a GitHub user's profile with proper error handling
 * @param username - Target GitHub username
 * @returns Normalized user profile data
 * @throws {Error} If authentication fails or user not found
 */
export async function fetchUserProfile(event: H3Event, username: string): Promise<UserProfileData> {
  const config = useRuntimeConfig()
  const token = config.githubToken

  if (!token) {
    console.error('GitHub token is missing')
    throw createError({
      statusCode: 401,
      message: 'GitHub authentication not configured',
    })
  }

  try {
    console.log('Fetching profile for:', username)
    const response = await $fetch<UserProfileData>(`${GITHUB_API_BASE}/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token}`, // Use 'token' prefix instead of 'Bearer'
      },
    })

    if (!response) {
      console.error('No response from GitHub API')
      throw new Error('No profile data returned')
    }

    return response
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error(`Error fetching profile for ${username}:`, error)
    throw createError({
      statusCode: error.response?.status || 401,
      message: error.response?.statusText || 'GitHub authentication failed',
    })
  }
}

/**
 * Retrieves a user's repositories with caching
 * @param username - GitHub username to fetch repos for
 * @param owner - Repository owner (can be different from username)
 * @returns Array of repository data, cached for 10 minutes
 */
export const fetchUserRepositories = defineCachedFunction(async (_event: H3Event, username: string, owner: string) => {
  const userData = await fetchUserProfile(_event, username)
  const { data: repositories } = await useOctokit().request('GET /users/{username}/repos', {
    username: userData.login,
    owner,
  })
  return repositories
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserRepositories',
  getKey: (_event: H3Event, username: string, owner: string) => `${username}/${owner}`,
})

/**
 * Fetches detailed repository information
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository metadata and stats
 */
export const fetchRepository = defineCachedFunction(async (_event: H3Event, username: string, owner: string, repo: string) => {
  const { data: repository } = await useOctokit().request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  })
  return repository
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchRepository',
  getKey: (_event: H3Event, username: string, owner: string, repo: string) => `${username}/${owner}/${repo}`,
})

/**
 * Gets recent activity events for a repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Recent repository events
 */
export const fetchUserActivity = defineCachedFunction(async (_event: H3Event, username: string, owner: string, repo: string) => {
  const { data: activity } = await useOctokit().request('GET /repos/{owner}/{repo}/events', {
    owner,
    repo,
  })
  return activity
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserActivity',
  getKey: (_event: H3Event, username: string, owner: string, repo: string) => `${username}/${owner}/${repo}`,
})

/**
 * Retrieves commit history with context
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param sha - Commit hash to fetch
 * @returns Commit data including changes and comments
 */
export const fetchCommitHistory = defineCachedFunction(async (_event: H3Event, username: string, owner: string, repo: string, sha: string) => {
  const { data: commit } = await useOctokit().request('GET /repos/{owner}/{repo}/commits/{sha}', {
    owner,
    repo,
    sha,
  })
  return commit
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchCommitHistory',
  getKey: (_event: H3Event, username: string, owner: string, repo: string, sha: string) => `${username}/${owner}/${repo}/${sha}`,
})

/**
 * Aggregates comprehensive GitHub stats for analysis
 * Combines profile, repo, and activity data
 * @param username - Target GitHub user
 * @returns Combined activity statistics
 */
export const fetchUserStats = defineCachedFunction(async (_event: H3Event, username: string) => {
  try {
    console.log('Fetching stats for user:', username)

    const userData = await fetchUserProfile(_event, username)
      .catch((error) => {
        console.error('Error fetching user profile:', error)
        throw createError({
          statusCode: error.status || 500,
          message: `Failed to fetch user profile: ${error.message}`,
        })
      })

    console.log('User profile fetched:', !!userData)

    const repositories = await fetchUserRepositories(_event, username, userData.login)
      .catch((error) => {
        console.error('Error fetching repositories:', error)
        return [] // Return empty array instead of throwing
      })

    console.log('Repositories fetched:', repositories?.length || 0)

    // Return minimal data if no repositories found
    if (!repositories?.length) {
      return {
        userData,
        repositories: [],
        activity: [],
        commit: null,
      }
    }

    const firstRepo = repositories[0]
    // Add null check for firstRepo
    if (!firstRepo?.name) {
      console.warn('First repository is invalid')
      return {
        userData,
        repositories,
        activity: [],
        commit: null,
      }
    }

    const activity = await fetchUserActivity(_event, username, userData.login, firstRepo.name)
      .catch((error) => {
        console.error('Error fetching activity:', error)
        return [] // Return empty array instead of throwing
      })

    console.log('Activity fetched:', activity?.length || 0)

    return {
      userData,
      repositories,
      activity: activity || [],
      commit: null,
    }
  }
  catch (error) {
    console.error('Error in fetchUserStats:', error)
    throw createError({
      statusCode: (error as GitHubError).status || 500,
      message: `Failed to fetch user stats: ${(error as Error).message}`,
      cause: error,
    })
  }
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserStats',
  getKey: (_event: H3Event, username: string) => username,
})

/**
 * Analyzes social network growth and interactions
 * @param username - Target GitHub user
 * @returns Social engagement metrics and trends
 */
export const fetchSocialTrends = defineCachedFunction(async (_event: H3Event, username: string) => {
  const octokit = useOctokit()

  // Get follower/following events
  const { data: events } = await octokit.request('GET /users/{username}/events', {
    username,
    per_page: 100,
  })

  // Get current follower/following lists for comparison
  const [followers, following] = await Promise.all([
    octokit.request('GET /users/{username}/followers', { username }),
    octokit.request('GET /users/{username}/following', { username }),
  ])

  return {
    currentStats: {
      followers: followers.data.length,
      following: following.data.length,
    },
    events: events.filter(e =>
      e.type === 'FollowEvent'
      || e.type === 'WatchEvent'
      || e.type === 'PublicEvent',
    ),
  }
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchSocialTrends',
  getKey: (_event: H3Event, username: string) => `social-${username}`,
})

/**
 * Analyzes coding patterns and behavior
 * @param username - Target GitHub user
 * @returns Categorized activity metrics for analysis
 */
export const fetchActivityMetrics = defineCachedFunction(async (_event: H3Event, username: string) => {
  try {
    console.log('Fetching activity metrics for:', username)
    const octokit = useOctokit()

    const { data: events } = await octokit.request('GET /users/{username}/events', {
      username,
      per_page: 100,
    })
    console.log('Events fetched:', events?.length || 0)

    return {
      commitPatterns: events.filter(e => e.type === 'PushEvent') || [],
      prActivity: events.filter(e => e.type === 'PullRequestEvent') || [],
      issueActivity: events.filter(e => e.type === 'IssuesEvent') || [],
      comments: events.filter(e =>
        e.type === 'IssueCommentEvent'
        || e.type === 'CommitCommentEvent',
      ) || [],
    }
  }
  catch (error) {
    console.error('Error in fetchActivityMetrics:', error)
    throw error
  }
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchActivityMetrics',
  getKey: (_event: H3Event, username: string) => `metrics-${username}`,
})
