export default defineNuxtConfig({
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

  ssr: true,
  // https://devtools.nuxt.com
  devtools: { enabled: true },

  css: [
    '@unocss/reset/tailwind.css',
    '@/assets/css/main.css',
  ],

  site: {
    url: 'https://example.com',
    name: 'GitHub Spirit Animal',
  },

  colorMode: {
    classSuffix: '',
    fallback: 'light',
    // Add storage key to match app.config.ts
    storageKey: 'github-spirit-color-mode',
    // Enable data-theme attribute
    dataValue: 'theme',
  },

  // Env variables - https://nuxt.com/docs/getting-started/configuration#environment-variables-and-private-tokens
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN, // server-side only
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
