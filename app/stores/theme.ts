import { defineStore } from 'pinia'
import type { AnimalCharacteristic } from '~~/types/github'

// Animals that naturally prefer dark mode based on activity patterns
const NOCTURNAL_ANIMALS = ['owl', 'wolf']

export const useThemeStore = defineStore('theme', () => {
  const colorMode = useColorMode()
  const currentTheme = ref<string>('wolf')
  const animalProfiles = ref<AnimalCharacteristic[]>([])

  // Reactive check for nocturnal animals to handle theme switching
  const isNocturnal = computed(() =>
    NOCTURNAL_ANIMALS.includes(currentTheme.value),
  )

  // Automatically adapt color scheme based on animal characteristics
  watch(currentTheme, (newTheme) => {
    if (NOCTURNAL_ANIMALS.includes(newTheme)) {
      colorMode.preference = 'dark'
    }
  })

  // Sets the active theme based on the most dominant animal characteristic
  function setThemeFromAnimals(animals: Pick<AnimalCharacteristic, 'animal' | 'percentage'>[]) {
    const dominantAnimal = animals[0]
    if (dominantAnimal) {
      currentTheme.value = dominantAnimal.animal.toLowerCase()
      animalProfiles.value = animals as AnimalCharacteristic[]
    }
    else {
      // Default theme when no animals are matched
      currentTheme.value = 'wolf'
      animalProfiles.value = []
    }

    // Set dark mode automatically for nocturnal animals
    if (NOCTURNAL_ANIMALS.includes(currentTheme.value)) {
      colorMode.preference = 'dark'
    }
  }

  // Toggles between light and dark mode while maintaining the current animal theme
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
