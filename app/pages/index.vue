<script setup lang="ts">
const username = ref('')
const router = useRouter()

function handleSearch(e: Event) {
  e.preventDefault()
  if (username.value.trim()) {
    router.push(`/${username.value.trim()}`)
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-responsive-4xl font-bold" style="color: var(--theme-primary)">
          GitHub Spirit Animal
        </h1>
        <p class="text-responsive-base text-[--gray11]">
          Discover which animal matches your GitHub personality
        </p>
      </div>

      <!-- Search Form -->
      <form class="space-y-4" @submit="handleSearch">
        <div class="relative">
          <input
            v-model="username"
            type="text"
            placeholder="Enter GitHub username"
            class="w-full border border-[--gray6] rounded-lg bg-[--gray3] px-4 py-3 outline-none transition-colors focus:border-[--gray8]"
          >
        </div>
        <button
          type="submit"
          class="w-full rounded-lg px-4 py-3 text-white transition-colors duration-300"
          :style="{ backgroundColor: 'var(--theme-primary)' }"
          :disabled="!username.trim()"
        >
          Analyze Profile
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
</style>
