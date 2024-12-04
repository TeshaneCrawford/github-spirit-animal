<script setup lang="ts">
import type { DailyActivity } from '~~/types/github'

defineProps<{
  heatmap: DailyActivity[] | null
}>()

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const getIntensityClass = (intensity: number) => {
  const classes = [
    'bg-[--gray4]',
    'bg-[--theme-badge]',
    'bg-[--theme-muted]',
    'bg-[--theme-primary]',
  ]
  return classes[intensity] || classes[0]
}
</script>

<template>
  <div class="border border-[--gray6] rounded-lg bg-[--gray2] p-6">
    <h3 class="mb-4 text-lg font-semibold">
      Activity Heatmap
    </h3>

    <div v-if="heatmap" class="overflow-x-auto">
      <div class="grid grid-cols-[auto_repeat(24,1fr)] min-w-[600px] gap-1">
        <!-- Hours header -->
        <div class="h-6" /> <!-- Empty corner cell -->
        <div v-for="hour in HOURS" :key="hour" class="text-center text-xs text-[--gray11]">
          {{ hour }}
        </div>

        <!-- Days and heatmap cells -->
        <template v-for="day in DAYS" :key="day">
          <div class="flex items-center pr-2 text-xs text-[--gray11]">
            {{ day }}
          </div>
          <div
            v-for="hour in HOURS"
            :key="`${day}-${hour}`"
            class="h-6 rounded"
            :class="getIntensityClass(heatmap.find(a => a.day === DAYS.indexOf(day) && a.hour === hour)?.intensity || 0)"
          />
        </template>
      </div>
    </div>
    <div v-else class="py-4 text-center text-[--gray11]">
      No activity data available
    </div>
  </div>
</template>
