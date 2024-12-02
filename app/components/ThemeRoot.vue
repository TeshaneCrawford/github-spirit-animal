<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Combine animal theme and color mode for styling
const themeClasses = computed(() => [
  `theme-${themeStore.currentTheme}`,
  themeStore.colorMode.value,
])
</script>

<template>
  <!-- Root theme container with smooth transitions -->
  <div :class="themeClasses" class="min-h-screen transition-colors duration-300">
    <slot />
  </div>
</template>

<style>
/* Animal-specific theme styles with light/dark variants */
.theme-wolf {
  @apply bg-red-1 text-red-12;
}
.theme-wolf.dark {
  @apply bg-red-dark-1 text-red-dark-12;
}

.theme-cat {
  @apply bg-orange-1 text-orange-12;
}
.theme-cat.dark {
  @apply bg-orange-dark-1 text-orange-dark-12;
}

.theme-beaver {
  @apply bg-brown-1 text-brown-12;
}
.theme-beaver.dark {
  @apply bg-brown-dark-1 text-brown-dark-12;
}

.theme-owl {
  @apply bg-purple-1 text-purple-12;
}
.theme-owl.dark {
  @apply bg-purple-dark-1 text-purple-dark-12;
}
</style>
