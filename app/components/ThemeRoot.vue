<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

// Combines the animal theme with current color mode for complete theme styling
const themeClasses = computed(() => [
  `theme-${themeStore.currentTheme}`,
  themeStore.colorMode.value,
])

// Syncs dark mode preference with HTML root element for system-wide theming
watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', themeStore.colorMode.value === 'dark')
  }
})
</script>

<template>
  <div :class="themeClasses" class="min-h-screen transition-colors duration-300">
    <slot />
  </div>
</template>

<style>
/* Radix UI color scale imports for consistent theming */
@import '@radix-ui/colors/red.css';
@import '@radix-ui/colors/red-dark.css';
@import '@radix-ui/colors/orange.css';
@import '@radix-ui/colors/orange-dark.css';
@import '@radix-ui/colors/brown.css';
@import '@radix-ui/colors/brown-dark.css';
@import '@radix-ui/colors/purple.css';
@import '@radix-ui/colors/purple-dark.css';

/*
 * Animal-specific theme variables
 * --theme-primary: Main brand color, used for buttons and active states
 * --theme-secondary: Supporting color, used for text and accents
 * --theme-muted: Subtle variant for backgrounds and disabled states
 */
.theme-wolf {
  --theme-primary: var(--red9);
  --theme-secondary: var(--red11);
  --theme-muted: var(--red8);
}

.theme-wolf.dark {
  --theme-primary: var(--red9);
  --theme-secondary: var(--red11);
  --theme-muted: var(--red8);
}

.theme-cat {
  --theme-primary: var(--orange9);
  --theme-secondary: var(--orange11);
}

.theme-cat.dark {
  --theme-primary: var(--orange9);
  --theme-secondary: var(--orange11);
}

.theme-beaver {
  --theme-primary: var(--brown9);
  --theme-secondary: var(--brown11);
}

.theme-beaver.dark {
  --theme-primary: var(--brown9);
  --theme-secondary: var(--brown11);
}

.theme-owl {
  --theme-primary: var(--purple9);
  --theme-secondary: var(--purple11);
}

.theme-owl.dark {
  --theme-primary: var(--purple9);
  --theme-secondary: var(--purple11);
}
</style>
