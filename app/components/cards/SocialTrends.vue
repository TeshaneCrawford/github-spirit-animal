<script setup lang="ts">
import {
  VueDataUi,
  type VueUiXyDatasetItem,
  type VueUiXyConfig,
} from 'vue-data-ui'
import type { TimelineData } from '~~/types/github'
import 'vue-data-ui/style.css'

// Define point interface
interface DataPoint {
  x: Date
  y: number
}

const props = defineProps<{
  followers: TimelineData[] | null
  following: TimelineData[] | null
}>()

// Transform data for xy chart
const dataset = computed<VueUiXyDatasetItem[]>(() => {
  const followersData: DataPoint[] = props.followers?.map(d => ({
    x: new Date(d.date),
    y: d.count,
  })) ?? []

  const followingData: DataPoint[] = props.following?.map(d => ({
    x: new Date(d.date),
    y: d.count,
  })) ?? []

  return [
    {
      name: 'Followers',
      type: 'line',
      series: followersData.map(d => d.y),
      dataPoints: followersData,
      stroke: '#3B82F6',
      fill: '#3B82F6',
      curve: 'monotone',
    },
    {
      name: 'Following',
      type: 'line',
      series: followingData.map(d => d.y),
      dataPoints: followingData,
      stroke: '#10B981',
      fill: '#10B981',
      curve: 'monotone',
    },
  ]
})

// Configure xy chart
const config = computed<VueUiXyConfig>(() => ({
  height: 250,
  margin: { top: 20, right: 20, bottom: 30, left: 40 },
  line: {
    curve: 'monotone',
    strokeWidth: 2,
  },
  point: {
    radius: 3,
  },
  axis: {
    x: {
      type: 'time',
      tickFormat: (d: Date) => d.toLocaleDateString(),
      tickCount: 5,
    },
    y: {
      type: 'linear',
      tickFormat: (d: number) => d.toString(),
      minValue: 0,
    },
  },
  grid: {
    x: false,
    y: true,
  },
  legend: {
    enabled: false,
  },
}))
</script>

<template>
  <div class="border border-[--gray6] rounded-lg bg-[--gray2] p-6">
    <h3 class="mb-4 text-lg font-semibold">
      Social Trends
    </h3>
    <!-- Chart Container -->
    <div class="relative h-64">
      <VueDataUi
        component="VueUiXy"
        :dataset="dataset"
        :config="config"
      />
    </div>
    <!-- ...existing code for legend... -->
    <div class="mt-4 flex justify-center gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded-full bg-[#3B82F6]" />
        <span>Followers</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded-full bg-[#10B981]" />
        <span>Following</span>
      </div>
    </div>
  </div>
</template>
