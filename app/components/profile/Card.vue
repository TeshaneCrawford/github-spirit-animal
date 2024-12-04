<script setup lang="ts">
import type { UserProfileData } from '~~/types/github'

// Make the prop optional with default values
const props = defineProps<{
  profile: UserProfileData | null
}>()

// Provide default values for optional fields
const profileData = computed(() => ({
  avatar_url: props.profile?.avatar_url ?? '',
  name: props.profile?.name ?? props.profile?.login ?? '',
  login: props.profile?.login ?? '',
  bio: props.profile?.bio ?? '',
  blog: props.profile?.blog ?? '',
  twitter_username: props.profile?.twitter_username ?? '',
  followers: props.profile?.followers ?? 0,
  following: props.profile?.following ?? 0,
  created_at: props.profile?.created_at ?? '',
}))
</script>

<template>
  <div class="border border-[--gray6] rounded-lg bg-[--gray2] p-6">
    <div class="flex items-center gap-4">
      <!-- Use computed values -->
      <img
        :src="profileData.avatar_url"
        :alt="profileData.login"
        class="h-16 w-16 border-2 border-[--gray6] rounded-full"
      >

      <div class="flex-1">
        <h2 class="text-responsive-xl font-bold">
          {{ profileData.name }}
        </h2>
        <p class="text-responsive-base text-[--gray11]">
          @{{ profileData.login }}
        </p>
      </div>
    </div>

    <p v-if="profileData.bio" class="mt-4 text-responsive-sm">
      {{ profileData.bio }}
    </p>

    <!-- Social Links -->
    <div class="mt-4 flex flex-wrap gap-4 text-responsive-sm text-[--gray11]">
      <a
        v-if="profileData.blog"
        :href="profileData.blog.startsWith('http') ? profileData.blog : `https://${profileData.blog}`"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1 hover:text-[--gray12]"
      >
        🌐 {{ profileData.blog }}
      </a>
      <a
        v-if="profileData.twitter_username"
        :href="`https://twitter.com/${profileData.twitter_username}`"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1 hover:text-[--gray12]"
      >
        𝕏 @{{ profileData.twitter_username }}
      </a>
    </div>

    <!-- Stats -->
    <div class="mt-4 flex gap-4 text-responsive-sm">
      <div>
        <span class="font-bold">{{ profileData.followers }}</span>
        <span class="text-[--gray11]"> followers</span>
      </div>
      <div>
        <span class="font-bold">{{ profileData.following }}</span>
        <span class="text-[--gray11]"> following</span>
      </div>
    </div>
  </div>
</template>
