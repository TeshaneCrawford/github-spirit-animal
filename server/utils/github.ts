import type { H3Event } from 'h3'
import { Octokit } from 'octokit'

// Singleton instance of Octokit client
let _octokit: Octokit

/**
 * Returns a singleton instance of Octokit client
 * Initializes with GitHub token if not already created
 */
export function useOctokit() {
  if (!_octokit) {
    _octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
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
export const fetchUserProfile = defineCachedFunction(async (_event: H3Event, username: string) => {
  const { data: userData } = await useOctokit().request('GET /user/{username}', {
    username,
  })
  return userData
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserProfile',
  getKey: (_event: H3Event, username: string) => username,
})

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
  const userData = await fetchUserProfile(_event, username)
  const repositories = await fetchUserRepositories(_event, username, userData.login)
  if (!repositories || repositories.length === 0) {
    throw new Error('No repositories found for the user.')
  }
  const activity = await fetchUserActivity(_event, username, userData.login, repositories[0].name)
  if (!activity || activity.length === 0) {
    throw new Error('No activity found for the repository.')
  }
  const { data: commits } = await useOctokit().request('GET /repos/{owner}/{repo}/commits', {
    owner: userData.login,
    repo: repositories[0].name,
  })
  if (!commits || commits.length === 0) {
    throw new Error('No commits found for the repository.')
  }
  const commit = await fetchCommitHistory(_event, username, userData.login, repositories[0].name, commits[0].sha)
  return {
    userData,
    repositories,
    activity,
    commit,
  }
}, {
  maxAge: 60 * 10,
  swr: true,
  group: 'github',
  name: 'fetchUserStats',
  getKey: (_event: H3Event, username: string) => username,
})
