/** Nuxt application configuration */

export default defineNuxtConfig({
  /** Core functionality modules */
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    'nuxt-og-image',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    'reka-ui/nuxt',
    '@pinia/nuxt',
  ],

  /** Build and runtime settings */
  ssr: true,
  devtools: { enabled: true },

  // Application styling
  css: [
    '@unocss/reset/tailwind.css',
    '@/assets/css/main.css',
  ],

  // Site metadata
  site: {
    url: 'https://example.com',
    name: 'GitHub Spirit Animal',
  },

  // Theme configuration
  colorMode: {
    classSuffix: '',
    fallback: 'light',
    storageKey: 'github-spirit-color-mode',
    dataValue: 'theme',
  },

  /** Environment and authentication */
  runtimeConfig: {
    githubToken: process.env.NUXT_GITHUB_TOKEN,
    public: {
      helloText: 'Your spirit animal is a 🦄',
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    componentIslands: true,
    // payloadExtraction: false,
    viewTransition: true,
  },

  compatibilityDate: '2024-07-30',

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    cache: true,
  },

  typescript: {
    typeCheck: true,
    strict: true,
    shim: true,
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },
})
