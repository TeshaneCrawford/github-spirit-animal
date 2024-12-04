<script setup lang="ts">
const route = useRoute()
const username = computed(() => route.params.username as string)
const { profile, spirit, activity, isLoading, error, refresh } = useGitHubData(username.value)
const themeStore = useThemeStore()

// Watch for spirit data changes and update theme
watch(() => spirit.data.value?.animals, (animals) => {
  if (animals?.length) {
    themeStore.setThemeFromAnimals(animals)
  }
}, { immediate: true })

// Debug logging
watchEffect(() => {
  console.log('GitHub Data:', {
    profile: profile.data.value,
    spirit: spirit.data.value,
    activity: activity.data.value,
  })
})

// Computed properties for type safety
const profileData = computed(() => profile.data.value ?? null)
const spiritData = computed(() => spirit.data.value ?? null)
const activityData = computed(() => activity.data.value ?? null)
</script>

<template>
  <main class="min-h-screen p-4 sm:p-8">
    <div class="mx-auto max-w-4xl">
      <!-- Search Bar -->
      <CommonSearchBar :initial-value="username" />

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center p-8">
        <CommonLoadingSpinner />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="border border-red-200 rounded-lg bg-red-50 p-4 text-center text-red-600"
      >
        {{ error.message }}
        <button
          class="mt-2 text-sm text-red-500 underline"
          @click="refresh"
        >
          Try Again
        </button>
      </div>

      <!-- Content -->
      <template v-else-if="profileData">
        <div class="grid gap-6 lg:grid-cols-2 sm:grid-cols-1">
          <!-- Left Column -->
          <div class="space-y-6">
            <ProfileCard :profile="profileData" />
            <CardsSpiritCard :spirit="spiritData" />
            <CardsActivityTrends :trends="activityData?.trends ?? null" />
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <CardsDailyActivity :activity="activityData?.current.daily ?? null" />
            <CardsActivityHeatmap :heatmap="activityData?.heatmap ?? null" />
          </div>
        </div>
      </template>

      <!-- No Data -->
      <div
        v-else
        class="border border-[--gray6] rounded-lg bg-[--gray2] p-8 text-center text-[--gray11]"
      >
        No profile data found for "{{ username }}"
      </div>
    </div>
  </main>
</template>
