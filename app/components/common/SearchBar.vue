<script setup lang="ts">
const props = defineProps<{
  initialValue: string
}>()

const username = ref(props.initialValue)
const router = useRouter()

function handleSearch(e: Event) {
  e.preventDefault()
  if (username.value.trim()) {
    router.push(`/${username.value.trim()}`)
  }
}
</script>

<template>
  <form class="mb-6" @submit="handleSearch">
    <div class="flex gap-2">
      <input
        v-model="username"
        type="text"
        placeholder="Enter GitHub username"
        class="flex-1 border border-[--theme-border] rounded-lg bg-[--gray3] px-4 py-2 outline-none transition-colors focus:border-[--theme-primary]"
      >
      <button
        type="submit"
        class="rounded-lg px-4 py-2 text-white transition-colors duration-300 hover:bg-[--theme-hover]"
        :style="{ backgroundColor: 'var(--theme-primary)' }"
        :disabled="!username.trim()"
      >
        Analyze
      </button>
    </div>
  </form>
</template>
