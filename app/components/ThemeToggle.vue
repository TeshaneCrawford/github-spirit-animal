<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Dynamic icon based on current color mode
const icon = computed(() => themeStore.colorMode.value === 'dark'
  ? 'lucide:moon-star'
  : 'lucide:sun-medium',
)

// Accessibility label for screen readers
const label = computed(() => `Switch to ${themeStore.colorMode.value === 'dark' ? 'light' : 'dark'} mode`)
</script>

<template>
  <button
    class="fixed bottom-4 right-4 transition-colors duration-300"
    :aria-label="label"
    @click="themeStore.toggleColorMode()"
  >
    <Icon :name="icon" class="h-6 w-6" :style="{ color: 'var(--theme-primary)' }" />
  </button>
</template>
