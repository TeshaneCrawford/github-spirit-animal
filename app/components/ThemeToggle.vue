<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const icon = computed(() => themeStore.colorMode.value === 'dark'
  ? 'lucide:moon-star'
  : 'lucide:sun-medium',
)
const label = computed(() => `Switch to ${themeStore.colorMode.value === 'dark' ? 'light' : 'dark'} mode`)
</script>

<template>
  <button
    class="fixed bottom-4 right-4 rounded-full p-2 transition-colors duration-300"
    :class="[
      themeStore.colorMode.value === 'dark' ? 'hover:bg-purple-5' : 'hover:bg-orange-5',
    ]"
    :aria-label="label"
    @click="themeStore.toggleColorMode()"
  >
    <Icon :name="icon" class="h-6 w-6" />
  </button>
</template>
