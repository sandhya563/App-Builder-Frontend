<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import ChatPanel from '@/components/ChatPanel.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import LivePreview from '@/components/LivePreview.vue'
import FileTree from '@/components/FileTree.vue'
import SnapshotHistory from '@/components/SnapshotHistory.vue'
import ResizeHandle from '@/components/ResizeHandle.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()
const projectsStore = useProjectsStore()

const isLoading = ref(true)
const showFileTree = ref(false)

// Mobile tab state
const mobileTab = ref<'chat' | 'editor' | 'preview'>('chat')

// Panel widths in pixels (desktop)
const chatWidth = ref(320)
const previewWidth = ref(450)
const containerRef = ref<HTMLElement | null>(null)

const MIN_CHAT = 200
const MAX_CHAT = 500
const MIN_PREVIEW = 250
const MIN_EDITOR = 300

function onChatResize(delta: number) {
  const newWidth = chatWidth.value + delta
  if (newWidth >= MIN_CHAT && newWidth <= MAX_CHAT) {
    chatWidth.value = newWidth
  }
}

function onPreviewResize(delta: number) {
  const newWidth = previewWidth.value - delta
  if (newWidth >= MIN_PREVIEW && containerRef.value) {
    const containerWidth = containerRef.value.offsetWidth
    const editorWidth = containerWidth - chatWidth.value - newWidth - 2
    if (editorWidth >= MIN_EDITOR) {
      previewWidth.value = newWidth
    }
  }
}

onMounted(async () => {
  const projectId = route.params.id as string
  editorStore.setProjectId(projectId)
  await projectsStore.fetchProject(projectId)
  await editorStore.fetchFiles()
  await editorStore.fetchChatHistory()
  await editorStore.fetchSnapshots()
  isLoading.value = false
})
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b px-3 md:px-4 py-2 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <Button variant="ghost" size="sm" class="shrink-0 px-2 md:px-3" @click="router.push('/dashboard')">←</Button>
        <h1 v-if="!isLoading" class="font-semibold text-sm md:text-base truncate">{{ projectsStore.currentProject?.name || '' }}</h1>
        <Skeleton v-else class="h-5 w-32 md:w-40" />
      </div>
      <div class="flex items-center gap-1 md:gap-2 shrink-0">
        <ThemeToggle />
        <SnapshotHistory />
      </div>
    </header>

    <!-- Skeleton loading state -->
    <div v-if="isLoading" class="flex-1 flex overflow-hidden">
      <div class="hidden md:flex w-80 border-r p-4 flex-col gap-4">
        <Skeleton class="h-6 w-16" />
        <div class="flex-1 space-y-3">
          <Skeleton class="h-10 w-3/4 ml-auto rounded-lg" />
          <Skeleton class="h-16 w-4/5 rounded-lg" />
          <Skeleton class="h-10 w-2/3 ml-auto rounded-lg" />
          <Skeleton class="h-20 w-4/5 rounded-lg" />
        </div>
        <Skeleton class="h-10 w-full rounded-md" />
      </div>
      <div class="flex-1 flex flex-col">
        <div class="border-b px-2 py-2 flex gap-2">
          <Skeleton class="h-7 w-20 rounded-md" />
          <Skeleton class="h-7 w-24 rounded-md" />
        </div>
        <div class="flex-1 p-4 space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-5/6" />
          <Skeleton class="h-4 w-4/5" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
        </div>
      </div>
      <div class="hidden lg:flex w-[40%] border-l flex-col">
        <div class="border-b px-4 py-2 flex justify-between">
          <Skeleton class="h-5 w-16" />
          <Skeleton class="h-7 w-20 rounded-md" />
        </div>
        <div class="flex-1 p-4">
          <Skeleton class="h-full w-full rounded-md" />
        </div>
      </div>
    </div>

    <!-- ==================== MOBILE LAYOUT ==================== -->
    <template v-else>
      <!-- Mobile tab bar -->
      <div class="md:hidden border-b flex shrink-0">
        <button
          :class="[
            'flex-1 py-2.5 text-xs font-medium text-center transition-colors relative',
            mobileTab === 'chat' ? 'text-primary' : 'text-muted-foreground',
          ]"
          @click="mobileTab = 'chat'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-0.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chat
          <div v-if="mobileTab === 'chat'" class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"></div>
        </button>
        <button
          :class="[
            'flex-1 py-2.5 text-xs font-medium text-center transition-colors relative',
            mobileTab === 'editor' ? 'text-primary' : 'text-muted-foreground',
          ]"
          @click="mobileTab = 'editor'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-0.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Code
          <div v-if="mobileTab === 'editor'" class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"></div>
        </button>
        <button
          :class="[
            'flex-1 py-2.5 text-xs font-medium text-center transition-colors relative',
            mobileTab === 'preview' ? 'text-primary' : 'text-muted-foreground',
          ]"
          @click="mobileTab = 'preview'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-0.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
          Preview
          <div v-if="mobileTab === 'preview'" class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"></div>
        </button>
      </div>

      <!-- Mobile panels (only show active tab) -->
      <div class="md:hidden flex-1 flex flex-col overflow-hidden">
        <div v-show="mobileTab === 'chat'" class="flex-1 flex flex-col overflow-hidden">
          <ChatPanel />
        </div>
        <div v-show="mobileTab === 'editor'" class="flex-1 flex overflow-hidden">
          <!-- Mobile file tree (slide-over) -->
          <div
            v-if="showFileTree"
            class="w-56 shrink-0 border-r overflow-y-auto bg-background"
          >
            <div class="px-3 py-2 border-b flex items-center justify-between">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</h3>
              <button class="p-1 rounded hover:bg-muted text-muted-foreground" @click="showFileTree = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <FileTree />
          </div>
          <!-- Editor -->
          <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CodeEditor v-model:showFileTree="showFileTree" />
          </div>
        </div>
        <div v-show="mobileTab === 'preview'" class="flex-1 flex flex-col overflow-hidden">
          <LivePreview />
        </div>
      </div>

      <!-- ==================== DESKTOP LAYOUT ==================== -->
      <div ref="containerRef" class="hidden md:flex flex-1 overflow-hidden">
        <!-- Chat Panel -->
        <div
          class="flex flex-col overflow-hidden shrink-0"
          :style="{ width: chatWidth + 'px' }"
        >
          <ChatPanel />
        </div>

        <!-- Resize handle: Chat ↔ Editor -->
        <ResizeHandle direction="horizontal" @resize="onChatResize" />

        <!-- File Tree + Code Editor wrapper -->
        <div class="flex-1 flex min-w-0 overflow-hidden">
          <!-- File Tree Sidebar -->
          <div
            v-if="showFileTree"
            class="w-48 shrink-0 border-r overflow-y-auto bg-background"
          >
            <div class="px-3 py-2 border-b">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</h3>
            </div>
            <FileTree />
          </div>

          <!-- Code Editor -->
          <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CodeEditor v-model:showFileTree="showFileTree" />
          </div>
        </div>

        <!-- Resize handle: Editor ↔ Preview -->
        <ResizeHandle direction="horizontal" @resize="onPreviewResize" />

        <!-- Live Preview -->
        <div
          class="flex flex-col min-w-0 overflow-hidden shrink-0"
          :style="{ width: previewWidth + 'px' }"
        >
          <LivePreview />
        </div>
      </div>
    </template>
  </div>
</template>
