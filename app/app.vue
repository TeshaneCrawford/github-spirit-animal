<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Map each animal to its accent color from Radix UI scale-9
const loadingColor = computed(() => {
  const themeColors = {
    wolf: '#E54D2E', // Energetic red for the social hunter
    cat: '#EC7E1C', // Warm orange for the independent spirit
    beaver: '#AD462C', // Earth brown for the builder
    owl: '#8E4EC6', // Deep purple for the wise observer
  }
  return themeColors[themeStore.currentTheme as keyof typeof themeColors] || themeColors.wolf
})
</script>

<template>
  <ThemeRoot>
    <NuxtRouteAnnouncer />
    <!-- Theme-aware loading indicator -->
    <NuxtLoadingIndicator :color="loadingColor" :height="3" />
    <NuxtPage />
    <ThemeToggle />
  </ThemeRoot>
</template>
