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
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  // Env variables - https://nuxt.com/docs/getting-started/configuration#environment-variables-and-private-tokens
  runtimeConfig: {
    public: {
      // Can be overridden by NUXT_PUBLIC_HELLO_TEXT environment variable
      helloText: 'Hello from the Edge 👋',
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
  hub: {},

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
