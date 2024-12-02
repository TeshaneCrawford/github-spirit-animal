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
/* Base light/dark styles */
:root {
  @apply bg-gray-1 text-gray-12;
}

:root.dark {
  @apply bg-gray-dark-1 text-gray-dark-12;
}

/* Animal-specific theme styles for components */
.theme-wolf {
  --theme-primary: var(--red9);
  --theme-secondary: var(--red11);
}
.theme-wolf.dark {
  --theme-primary: var(--redDark9);
  --theme-secondary: var(--redDark11);
}

.theme-cat {
  --theme-primary: var(--orange9);
  --theme-secondary: var(--orange11);
}
.theme-cat.dark {
  --theme-primary: var(--orangeDark9);
  --theme-secondary: var(--orangeDark11);
}

.theme-beaver {
  --theme-primary: var(--brown9);
  --theme-secondary: var(--brown11);
}
.theme-beaver.dark {
  --theme-primary: var(--brownDark9);
  --theme-secondary: var(--brownDark11);
}

.theme-owl {
  --theme-primary: var(--purple9);
  --theme-secondary: var(--purple11);
}
.theme-owl.dark {
  --theme-primary: var(--purpleDark9);
  --theme-secondary: var(--purpleDark11);
}
</style>
