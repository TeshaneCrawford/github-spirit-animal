import type {
  UserProfileData,
  SpiritAnimalProfile,
  ActivityStats,
} from '~~/types/github'

/**
 * Composable for fetching GitHub user profile data
 * Includes basic profile information and social stats
 */
export function useGitHubProfile(username: string) {
  return useAsyncData<UserProfileData | null>(
    `github-profile-${username}`,
    () => $fetch(`/api/github/users/${username}`).catch(() => null),
    {
      watch: [() => username],
      transform: (data) => {
        if (!data) return null
        return {
          ...data,
          created_at: new Date(data.created_at).toLocaleDateString(),
        }
      },
    },
  )
}

/**
 * Composable for fetching spirit animal analysis
 * Includes activity patterns and animal matches
 */
export function useGitHubSpirit(username: string) {
  return useAsyncData<SpiritAnimalProfile>(
    `github-spirit-${username}`,
    () => $fetch<SpiritAnimalProfile>(`/api/github/users/${username}/spirit-analysis`),
    {
      transform: (data) => {
        console.log('Spirit data received:', data)
        return data
      },
    },
  )
}

/**
 * Composable for fetching detailed activity statistics
 * Includes metrics, heatmap, and engagement data
 */
export function useGitHubActivity(username: string) {
  return useAsyncData<ActivityStats>(
    `github-activity-${username}`,
    () => $fetch<ActivityStats>(`/api/github/users/${username}/activity`),
    {
      transform: data => ({
        ...data,
        current: {
          ...data.current,
          daily: {
            ...data.current.daily,
            timestamp: new Date(data.current.daily.timestamp).toLocaleString(),
          },
        },
      }),
    },
  )
}

/**
 * Combined composable that fetches all GitHub data
 */
export function useGitHubData(username: string) {
  const profile = useGitHubProfile(username)
  const spirit = useGitHubSpirit(username)
  const activity = useGitHubActivity(username)

  const isLoading = computed(() =>
    profile.status.value === 'pending'
    || spirit.status.value === 'pending'
    || activity.status.value === 'pending',
  )

  const error = computed(() => {
    const failedRequest = [profile, spirit, activity].find(data =>
      data.status.value === 'error',
    )
    return failedRequest?.error.value
  })

  async function refresh() {
    await Promise.all([
      profile.refresh(),
      spirit.refresh(),
      activity.refresh(),
    ])
  }

  return {
    profile,
    spirit,
    activity,
    isLoading,
    error,
    refresh,
  }
}
