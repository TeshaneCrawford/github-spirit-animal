<script setup lang="ts">
import type { SpiritAnimalProfile } from '~~/types/github'

// Make the prop optional with default values
const props = defineProps<{
  spirit: SpiritAnimalProfile | null
}>()

// Provide default values for optional fields
const spiritData = computed(() => ({
  animals: props.spirit?.animals ?? [],
  dominantTraits: props.spirit?.dominantTraits ?? [],
  activityPattern: props.spirit?.activityPattern ?? 'diurnal',
  consistency: props.spirit?.consistency ?? 'low',
}))
</script>

<template>
  <div class="border border-[--theme-border] rounded-lg bg-[--gray2] p-6">
    <!-- Spirit Animals -->
    <div v-if="spiritData.animals.length" class="space-y-4">
      <h3 class="text-lg font-semibold text-[--theme-secondary]">
        Your GitHub Spirit Animals
      </h3>

      <div class="space-y-3">
        <div
          v-for="animal in spiritData.animals"
          :key="animal.animal"
          class="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[--theme-badge]"
          :style="{ backgroundColor: `${animal.color}15` }"
        >
          <div class="text-2xl">
            <Icon :name="animal.emoji" />
          </div>
          <div class="flex-1">
            <div class="font-medium">
              {{ animal.animal }}
            </div>
            <div class="text-sm text-[--gray11]">
              Match: {{ animal.percentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="py-4 text-center text-[--gray11]">
      Not enough activity to determine spirit animal.
      Try contributing more to GitHub!
    </div>

    <!-- Traits -->
    <div v-if="spiritData.dominantTraits.length" class="mt-6">
      <h4 class="mb-2 text-sm font-medium text-[--theme-secondary]">
        Your Dominant Traits
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="trait in spiritData.dominantTraits"
          :key="trait"
          class="rounded-full bg-[--theme-badge] px-2 py-1 text-sm text-[--theme-secondary]"
        >
          {{ trait }}
        </span>
      </div>
    </div>

    <!-- Activity Pattern -->
    <div class="mt-6 text-sm text-[--gray11]">
      <div>Activity Pattern: {{ spiritData.activityPattern }}</div>
      <div>Consistency Level: {{ spiritData.consistency }}</div>
    </div>
  </div>
</template>
