<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'

const editorStore = useEditorStore()
const authStore = useAuthStore()
const iframeKey = ref(0)
const viewMode = ref<'desktop' | 'mobile'>('desktop')
const isFullPage = ref(false)

const SCRIPT_CLOSE = '<' + '/script>'
const SCRIPT_OPEN = '<' + 'script>'

// Build the srcdoc from project files
const previewSrc = computed(() => {
  const indexFile = editorStore.files.find(
    (f) => f.path === 'index.html' || f.path === '/index.html',
  )

  if (!indexFile) {
    return '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;"><p>No index.html found. Generate code first.</p></body></html>'
  }

  let html = indexFile.content

  // If content has import/export statements, it's old-format code that can't run in browser
  // Show a helpful message instead of a blank screen
  if (html.includes('import ') && !html.includes('<script')) {
    return '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;padding:20px;text-align:center;"><p>This project uses module-based code that requires a build step.<br><br>Create a new project and send a fresh prompt to generate browser-compatible code.</p></body></html>'
  }

  // Inject HL config before first script tag or at start of head
  const configCode = [
    'window.__HL_ACCESS_TOKEN__ = "";',
    `window.__HL_LOCATION_ID__ = "${authStore.hlLocationId || ''}";`,
    `window.__API_BASE_URL__ = "${import.meta.env.VITE_API_URL || '/api'}";`,
  ].join('\n')
  const configTag = SCRIPT_OPEN + configCode + SCRIPT_CLOSE

  if (html.includes('</head>')) {
    html = html.replace('</head>', configTag + '\n</head>')
  } else if (html.includes('<script')) {
    // Insert before first script tag
    html = html.replace('<script', configTag + '\n<script')
  } else {
    html = configTag + '\n' + html
  }

  // Inject any separate CSS files as inline styles
  const cssFiles = editorStore.files.filter(
    (f) => f.path.endsWith('.css') && f.path !== 'index.html',
  )
  if (cssFiles.length > 0) {
    const cssInject = cssFiles
      .map((f) => `<style>/* ${f.path} */\n${f.content}</style>`)
      .join('\n')
    if (html.includes('</head>')) {
      html = html.replace('</head>', cssInject + '\n</head>')
    } else {
      html = cssInject + '\n' + html
    }
  }

  return html
})

function refreshPreview() {
  iframeKey.value++
}

function openFullPage() {
  isFullPage.value = true
}

function closeFullPage() {
  isFullPage.value = false
}

// Auto-refresh when generation completes
watch(
  () => editorStore.isGenerating,
  (generating, wasGenerating) => {
    if (!generating && wasGenerating) {
      setTimeout(() => {
        iframeKey.value++
      }, 500)
    }
  },
)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="border-b px-3 py-2 flex items-center justify-between shrink-0">
      <h2 class="font-medium text-sm">Preview</h2>
      <div class="flex items-center gap-1">
        <button
          :class="[
            'px-2 py-1 rounded text-xs transition-colors',
            viewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
          ]"
          @click="viewMode = 'desktop'"
          title="Desktop view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </button>
        <button
          :class="[
            'px-2 py-1 rounded text-xs transition-colors',
            viewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
          ]"
          @click="viewMode = 'mobile'"
          title="Mobile view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
        </button>
        <button
          class="px-2 py-1 rounded text-xs transition-colors hover:bg-muted text-muted-foreground"
          title="Full page preview"
          @click="openFullPage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        </button>
        <Button variant="ghost" size="sm" @click="refreshPreview">Refresh</Button>
      </div>
    </div>

    <!-- Preview area -->
    <div class="flex-1 bg-muted/30 flex items-start justify-center overflow-auto p-2">
      <div
        :class="[
          'bg-white shadow-sm border rounded overflow-hidden transition-all duration-200 h-full',
          viewMode === 'mobile' ? 'w-[375px] max-w-full' : 'w-full',
        ]"
      >
        <iframe
          :key="iframeKey"
          :srcdoc="previewSrc"
          class="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>

    <!-- Full page overlay -->
    <Teleport to="body">
      <div
        v-if="isFullPage"
        class="fixed inset-0 z-50 bg-background flex flex-col"
      >
        <!-- Full page header -->
        <div class="border-b px-4 py-2 flex items-center justify-between shrink-0">
          <h2 class="font-medium text-sm">Full Page Preview</h2>
          <div class="flex items-center gap-2">
            <button
              :class="[
                'px-2 py-1 rounded text-xs transition-colors',
                viewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
              ]"
              @click="viewMode = 'desktop'"
              title="Desktop view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            </button>
            <button
              :class="[
                'px-2 py-1 rounded text-xs transition-colors',
                viewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
              ]"
              @click="viewMode = 'mobile'"
              title="Mobile view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
            </button>
            <Button variant="ghost" size="sm" @click="refreshPreview">Refresh</Button>
            <Button variant="outline" size="sm" @click="closeFullPage">
              ✕ Close
            </Button>
          </div>
        </div>
        <!-- Full page iframe -->
        <div class="flex-1 bg-muted/30 flex items-start justify-center overflow-auto p-4">
          <div
            :class="[
              'bg-white shadow-sm border rounded overflow-hidden transition-all duration-200 h-full',
              viewMode === 'mobile' ? 'w-[375px]' : 'w-full',
            ]"
          >
            <iframe
              :key="'full-' + iframeKey"
              :srcdoc="previewSrc"
              class="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
