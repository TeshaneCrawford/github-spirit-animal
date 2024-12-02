import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import * as colors from '@radix-ui/colors'

// Convert Radix UI color tokens to CSS custom properties
const radixToCustomProperties = (colorObj: Record<string, string>) => {
  return Object.entries(colorObj).reduce((acc, [key, value]) => {
    acc[`--${key}`] = value
    return acc
  }, {} as Record<string, string>)
}

// Define theme colors for each spirit animal
const animalThemes = {
  wolf: {
    ...radixToCustomProperties(colors.red),
    ...radixToCustomProperties(colors.redDark),
  },
  cat: {
    ...radixToCustomProperties(colors.orange),
    ...radixToCustomProperties(colors.orangeDark),
  },
  beaver: {
    ...radixToCustomProperties(colors.brown),
    ...radixToCustomProperties(colors.brownDark),
  },
  owl: {
    ...radixToCustomProperties(colors.purple),
    ...radixToCustomProperties(colors.purpleDark),
  },
}

// Add neutral colors for light/dark mode
const baseTheme = {
  light: {
    ...radixToCustomProperties(colors.gray),
  },
  dark: {
    ...radixToCustomProperties(colors.grayDark),
  },
}

export default defineConfig({
  shortcuts: [
    // ...
  ],
  theme: {
    fontFamily: {
      sans: 'DM Sans, sans-serif',
      mono: 'DM Mono, monospace',
    },
    colors: {
      theme: {
        ...baseTheme.light,
        ...animalThemes.wolf,
      },
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        // Avoid crushing of icons in crowded situations
        'min-width': '1.2em',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
