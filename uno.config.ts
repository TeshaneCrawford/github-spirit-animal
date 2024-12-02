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
    // Remove the 'A' from alpha channel colors if present
    const propertyKey = key.replace(/A$/, '')
    acc[`--${propertyKey}`] = value
    return acc
  }, {} as Record<string, string>)
}

// Log the generated theme for debugging
const wolfTheme = {
  ...radixToCustomProperties(colors.red),
  ...radixToCustomProperties(colors.redDark),
}
console.log('Wolf theme tokens:', wolfTheme)

// Define theme colors for each spirit animal - restructure to separate light/dark
const animalThemes = {
  wolf: {
    light: radixToCustomProperties(colors.red),
    dark: radixToCustomProperties(colors.redDark),
  },
  cat: {
    light: radixToCustomProperties(colors.orange),
    dark: radixToCustomProperties(colors.orangeDark),
  },
  beaver: {
    light: radixToCustomProperties(colors.brown),
    dark: radixToCustomProperties(colors.brownDark),
  },
  owl: {
    light: radixToCustomProperties(colors.purple),
    dark: radixToCustomProperties(colors.purpleDark),
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

// Typography scale configuration
const typographyScale = {
  'xs': ['0.75rem', '1rem'], // 12px, 16px line height
  'sm': ['0.875rem', '1.25rem'], // 14px, 20px line height
  'base': ['1rem', '1.5rem'], // 16px, 24px line height
  'lg': ['1.125rem', '1.75rem'], // 18px, 28px line height
  'xl': ['1.25rem', '1.75rem'], // 20px, 28px line height
  '2xl': ['1.5rem', '2rem'], // 24px, 32px line height
  '3xl': ['1.875rem', '2.25rem'], // 30px, 36px line height
  '4xl': ['2.25rem', '2.5rem'], // 36px, 40px line height
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
    // Add responsive font sizes
    fontSize: {
      ...typographyScale,
      // Responsive variations
      'responsive-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', '1rem'],
      'responsive-sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', '1.25rem'],
      'responsive-base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', '1.5rem'],
      'responsive-lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', '1.75rem'],
      'responsive-xl': ['clamp(1.25rem, 1.125rem + 0.75vw, 1.5rem)', '1.75rem'],
      'responsive-2xl': ['clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)', '2rem'],
      'responsive-3xl': ['clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)', '2.25rem'],
      'responsive-4xl': ['clamp(2.25rem, 1.875rem + 2.5vw, 3rem)', '2.5rem'],
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
  // Add CSS variables to :root
  preflights: [
    {
      getCSS: () => `
        :root {
          ${Object.entries(baseTheme.light)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')}
        }
        :root.dark {
          ${Object.entries(baseTheme.dark)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')}
        }
        ${Object.entries(animalThemes)
          .map(([animal, theme]) => `
            .theme-${animal} {
              ${Object.entries(theme.light)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n')}
            }
            .theme-${animal}.dark {
              ${Object.entries(theme.dark)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n')}
            }
          `)
          .join('\n')}
      `,
    },
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
