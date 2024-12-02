import { defineStore } from 'pinia'
import type { AnimalCharacteristic } from '~~/types/github'

// Animals that should trigger dark mode automatically
const NOCTURNAL_ANIMALS = ['owl', 'wolf']

export const useThemeStore = defineStore('theme', () => {
  const colorMode = useColorMode()
  const currentTheme = ref<string>('wolf')
  const animalProfiles = ref<AnimalCharacteristic[]>([])

  // Track if current animal should use dark mode by default
  const isNocturnal = computed(() =>
    NOCTURNAL_ANIMALS.includes(currentTheme.value),
  )

  // Automatically switch to dark mode for nocturnal animals
  watch(currentTheme, (newTheme) => {
    if (NOCTURNAL_ANIMALS.includes(newTheme)) {
      colorMode.preference = 'dark'
    }
  })

  // Update theme based on dominant spirit animal characteristics
  function setThemeFromAnimals(animals: AnimalCharacteristic[]) {
    const dominantAnimal = animals[0]
    if (dominantAnimal) {
      currentTheme.value = dominantAnimal.animal.toLowerCase()
      animalProfiles.value = animals
    }
  }

  // Toggle between light and dark mode while preserving animal theme
  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    currentTheme,
    animalProfiles,
    setThemeFromAnimals,
    toggleColorMode,
    isNocturnal,
    colorMode,
  }
})
