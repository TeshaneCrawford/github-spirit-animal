<script setup lang="ts">
import type { UserActivity } from '~~/types/github'

const props = defineProps<{
  activity: UserActivity | null
}>()

const activityData = computed(() => ({
  commits: props.activity?.commits ?? 0,
  pullRequests: props.activity?.pullRequests ?? 0,
  issues: props.activity?.issues ?? 0,
  comments: props.activity?.comments ?? 0,
  repositories: props.activity?.repositories ?? 0,
  contributions: props.activity?.contributions ?? 0,
}))
</script>

<template>
  <div class="border border-[--theme-border] rounded-lg bg-[--gray2] p-6">
    <h3 class="mb-4 text-lg text-[--theme-secondary] font-semibold">
      Today's Activity
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="(value, key) in activityData"
        :key="key"
        class="rounded-lg bg-[--theme-badge] p-3 transition-colors hover:bg-[--theme-muted]"
      >
        <div class="text-sm text-[--theme-secondary] capitalize">
          {{ key }}
        </div>
        <div class="text-xl font-semibold">
          {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>
