<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/lib/api'

const props = defineProps<{
  projectId: string
  hasFiles: boolean
}>()

const previewHtml = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  if (!props.hasFiles) {
    loading.value = false
    return
  }

  try {
    const { data } = await api.get(`/projects/${props.projectId}/files/content`, {
      params: { path: 'index.html' },
    })
    previewHtml.value = data.data.content
  } catch {
    previewHtml.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="w-full aspect-video overflow-hidden bg-muted/50 border-b relative">
    <!-- Loading state -->
    <div v-if="loading" class="w-full h-full animate-pulse bg-muted"></div>

    <!-- No files / no index.html -->
    <div v-else-if="!previewHtml" class="w-full h-full flex items-center justify-center">
      <div class="text-center text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-1 opacity-40">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="m9 8 6 4-6 4Z"/>
        </svg>
        <span class="text-[10px]">No preview</span>
      </div>
    </div>

    <!-- Live preview thumbnail -->
    <div v-else class="w-full h-full overflow-hidden relative">
      <div class="absolute inset-0 origin-top-left" style="width: 400%; height: 400%;">
        <iframe
          :srcdoc="previewHtml"
          class="w-full h-full border-0"
          style="transform: scale(0.25); transform-origin: top left; width: 100%; height: 100%;"
          sandbox="allow-scripts allow-same-origin"
          tabindex="-1"
          loading="lazy"
        />
      </div>
      <!-- Overlay to prevent interaction -->
      <div class="absolute inset-0 z-10"></div>
    </div>
  </div>
</template>
