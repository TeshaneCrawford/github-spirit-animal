<script setup lang="ts">
import type { ActivityTrends } from '~~/types/github'

defineProps<{
  trends: ActivityTrends | null
}>()
</script>

<template>
  <div class="border border-[--gray6] rounded-lg bg-[--gray2] p-6">
    <h3 class="mb-4 text-lg font-semibold">
      Activity Trends
    </h3>
    <div v-if="trends" class="grid grid-cols-2 gap-4">
      <div class="rounded-lg bg-[--gray3] p-3">
        <div class="text-sm text-[--gray11]">
          Daily Average
        </div>
        <div class="text-xl font-semibold">
          {{ Math.round(trends.dailyAverage) }}
        </div>
      </div>
      <div class="rounded-lg bg-[--gray3] p-3">
        <div class="text-sm text-[--gray11]">
          Weekly Growth
        </div>
        <div class="text-xl font-semibold">
          {{ Math.round(trends.weeklyGrowth) }}%
        </div>
      </div>
      <div class="col-span-2 rounded-lg bg-[--gray3] p-3">
        <div class="text-sm text-[--gray11]">
          Peak Activity
        </div>
        <div class="text-base">
          {{ trends.mostActiveDay }} at {{ trends.mostActiveTime }}
        </div>
      </div>
    </div>
  </div>
</template>
