<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <div>
    <h1>
      {{ runtimeConfig.public.helloText }}
    </h1>
    <NuxtLink to="/" external>
      refresh
    </NuxtLink>
  </div>
</template>

<style scoped>
</style>
