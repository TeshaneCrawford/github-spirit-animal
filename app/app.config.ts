export default defineAppConfig({
  // Color mode configuration for theme system
  colorMode: {
    classSuffix: '', // No suffix for simpler CSS selectors
    fallback: 'light', // Default to light mode
    storageKey: 'github-spirit-color-mode', // Persistent preference storage
  },
})
