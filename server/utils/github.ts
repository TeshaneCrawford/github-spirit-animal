import type { H3Event } from 'h3'
import { Octokit } from 'octokit'
import type { UserProfileData, GitHubError } from '~~/types/github'

// Singleton instance of Octokit client
let _octokit: Octokit

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Returns a singleton instance of Octokit client
 * Initializes with GitHub token if not already created
 */
export function useOctokit() {
  if (!_octokit) {
    _octokit = new Octokit({
      auth: process.env.NUXT_GITHUB_TOKEN,
    })
  }
  return _octokit
}

/**
 * Fetches and caches a GitHub user's profile information
 * @param username - GitHub username
 * @returns User profile data
 * @cache 10 minutes with stale-while-revalidate
 */
export async function fetchUserProfile(event: H3Event, username: string): Promise<UserProfileData> {
  const config = useRuntimeConfig()

  try {
    const userData = await $fetch<UserProfileData>(`${GITHUB_API_BASE}/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.githubToken}`,
      },
    })

    if (!userData || !userData.login) {
      throw new Error('Invalid user data received')
    }

    return {
      avatar_url: userData.avatar_url,
      name: userData.name,
      login: userData.login,
      bio: userData.bio,
      blog: userData.blog,
      twitter_username: userData.twitter_username,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.created_at,
    }
  }
  catch (error) {
    throw createError({
      statusCode: (error as GitHubError).status || 500,
      message: (error as Error).message || 'Failed to fetch user profile',
    })
  }
}

/**
 * Fetches and caches a user's repositories
 * @param username - GitHub username
 * @param owner - Repository owner
 * @returns Array of repository data
 * @cache 10 minutes with stale-while-revalidate
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
 * Fetches and caches details of a specific repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository data
 * @cache 10 minutes with stale-while-revalidate
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
 * Fetches and caches recent activity events for a repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Array of activity events
 * @cache 10 minutes with stale-while-revalidate
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
 * Fetches and caches details of a specific commit
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param sha - Commit SHA
 * @returns Commit data
 * @cache 10 minutes with stale-while-revalidate
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
 * Aggregates and caches comprehensive user statistics
 * Combines profile, repositories, activity, and latest commit data
 * @param username - GitHub username
 * @returns Combined user statistics
 * @throws Error if repositories, activity, or commits are not found
 * @cache 10 minutes with stale-while-revalidate
 */
export const fetchUserStats = defineCachedFunction(async (_event: H3Event, username: string) => {
  try {
    console.log('Fetching stats for user:', username)
    const userData = await fetchUserProfile(_event, username)
    console.log('User profile fetched:', !!userData)

    const repositories = await fetchUserRepositories(_event, username, userData.login)
    console.log('Repositories fetched:', repositories?.length || 0)

    if (!repositories?.length) {
      return {
        userData,
        repositories: [],
        activity: [],
        commit: null,
      }
    }

    const firstRepo = repositories[0]
    if (!firstRepo) {
      throw new Error('Repository data is invalid')
    }

    const activity = await fetchUserActivity(_event, username, userData.login, firstRepo.name)
    console.log('Activity fetched:', activity?.length || 0)

    return {
      userData,
      repositories,
      activity: activity || [],
      commit: null, // Make commit optional
    }
  }
  catch (error) {
    console.error('Error in fetchUserStats:', error)
    throw error
  }
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserStats',
  getKey: (_event: H3Event, username: string) => username,
})

/**
 * Fetches social network activity and growth metrics
 * @param username GitHub username
 * @returns Object containing:
 * - Current follower/following counts
 * - Recent social events (follows, watches, etc.)
 * - Interaction patterns with other users
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
 * Fetches and analyzes user's coding behavior patterns
 * Used for spirit animal matching and activity profiling
 * @param username GitHub username
 * @returns Object containing categorized activity metrics:
 * - Commit patterns and frequency
 * - PR creation and review activity
 * - Issue participation and comments
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
