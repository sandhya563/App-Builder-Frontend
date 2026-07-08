<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import Skeleton from '@/components/ui/Skeleton.vue'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex flex-col items-center justify-center gap-4">
    <Skeleton class="h-8 w-48" />
    <Skeleton class="h-4 w-32" />
    <div class="mt-6 w-80 space-y-3">
      <Skeleton class="h-10 w-full rounded-md" />
      <Skeleton class="h-10 w-full rounded-md" />
      <Skeleton class="h-10 w-full rounded-md" />
    </div>
  </div>
  <RouterView v-else v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>
