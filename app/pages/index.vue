<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const animals = ['wolf', 'cat', 'beaver', 'owl'] as const

function setAnimal(animal: typeof animals[number]) {
  themeStore.setThemeFromAnimals([{ animal, percentage: 100 }])
}
</script>

<template>
  <main class="p-8">
    <!-- Theme test card -->
    <div class="mx-auto max-w-md border border-gray-200 rounded-lg p-6 space-y-6 dark:border-gray-800">
      <h1 class="text-2xl font-bold" style="color: var(--theme-secondary)">
        Theme Tester
      </h1>

      <!-- Animal selector buttons -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="animal in animals"
          :key="animal"
          class="rounded-full px-4 py-2 transition-colors duration-300"
          :class="[
            themeStore.currentTheme === animal ? 'bg-current text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          :style="themeStore.currentTheme === animal ? { backgroundColor: 'var(--theme-primary)' } : {}"
          @click="setAnimal(animal)"
        >
          {{ animal }}
        </button>
      </div>

      <!-- Theme preview elements -->
      <div class="space-y-4">
        <div
          class="h-24 flex items-center justify-center rounded-md text-white"
          :style="{ backgroundColor: 'var(--theme-primary)' }"
        >
          Primary Color Block
        </div>
        <div
          class="h-24 flex items-center justify-center rounded-md text-white"
          :style="{ backgroundColor: 'var(--theme-secondary)' }"
        >
          Secondary Color Block
        </div>
      </div>

      <!-- Current theme info -->
      <div class="text-sm">
        <p>Current Theme: <span style="color: var(--theme-primary)">{{ themeStore.currentTheme }}</span></p>
        <p>Color Mode: <span style="color: var(--theme-secondary)">{{ themeStore.colorMode.value }}</span></p>
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
