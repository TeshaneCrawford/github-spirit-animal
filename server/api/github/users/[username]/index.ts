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

    if (!profile || !profile.login) {
      throw createError({
        statusCode: 404,
        message: `No profile found for username: ${username}`,
      })
    }

    return {
      avatar_url: profile.avatar_url || '',
      name: profile.name || username,
      login: profile.login,
      bio: profile.bio || '',
      blog: profile.blog || '',
      twitter_username: profile.twitter_username || '',
      followers: profile.followers || 0,
      following: profile.following || 0,
      created_at: profile.created_at,
    }
  }
  catch (error: unknown) {
    const githubError = error as GitHubError
    console.error('Profile fetch error:', githubError)

    throw createError({
      statusCode: githubError.status || githubError.response?.status || 500,
      message: githubError.message || `Failed to fetch profile for ${username}`,
      cause: error,
    })
  }
})
