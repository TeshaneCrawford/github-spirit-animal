import unocss from '@unocss/eslint-config/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  unocss,
).overrideRules({
  'vue/max-attributes-per-line': ['warn', { singleline: 3 }],
})
