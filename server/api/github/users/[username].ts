import type { UserProfileData, GitHubError } from '~~/types/github'
import { fetchUserProfile } from '~~/server/utils/github'

export default defineEventHandler(async (event): Promise<UserProfileData> => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required',
    })
  }

  try {
    const profile = await fetchUserProfile(event, username)
    return {
      avatar_url: profile.avatar_url,
      name: profile.name,
      login: profile.login,
      bio: profile.bio,
      blog: profile.blog,
      twitter_username: profile.twitter_username,
      followers: profile.followers,
      following: profile.following,
      created_at: profile.created_at,
    }
  }
  catch (error: unknown) {
    const githubError = error as GitHubError
    throw createError({
      statusCode: githubError.status || githubError.response?.status || 500,
      message: githubError.message || 'Failed to fetch user data',
    })
  }
})
