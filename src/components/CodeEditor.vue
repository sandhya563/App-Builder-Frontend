<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  showFileTree?: boolean
}>()

const emit = defineEmits<{
  'update:showFileTree': [value: boolean]
}>()

const editorStore = useEditorStore()
const editorContent = ref('')
const MonacoEditor = ref<any>(null)

// Dynamically import Monaco
import { shallowRef, onMounted } from 'vue'

const VueMonacoEditor = shallowRef<any>(null)

onMounted(async () => {
  const module = await import('@guolao/vue-monaco-editor')
  VueMonacoEditor.value = module.default || module.VueMonacoEditor
})

const currentContent = computed(() => editorStore.activeFileContent)

watch(currentContent, (val) => {
  editorContent.value = val
}, { immediate: true })

// Determine language from file extension
const language = computed(() => {
  const path = editorStore.activeFile || ''
  if (path.endsWith('.vue')) return 'html'
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript'
  if (path.endsWith('.html')) return 'html'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.json')) return 'json'
  return 'plaintext'
})

async function saveFile() {
  if (!editorStore.activeFile) return
  await editorStore.saveFile(editorStore.activeFile, editorContent.value)
}

function handleEditorChange(value: string | undefined) {
  if (value !== undefined) {
    editorContent.value = value
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- File tabs / tree -->
    <div class="border-b px-2 py-1 flex items-center gap-1 overflow-x-auto shrink-0">
      <!-- File tree toggle -->
      <button
        class="p-1.5 rounded hover:bg-muted transition-colors shrink-0"
        :class="props.showFileTree ? 'bg-muted' : ''"
        title="Toggle file tree"
        @click="emit('update:showFileTree', !props.showFileTree)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
      </button>
      <div class="w-px h-5 bg-border shrink-0"></div>
      <!-- File tabs -->
      <button
        v-for="file in editorStore.files"
        :key="file.path"
        :class="[
          'px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors',
          editorStore.activeFile === file.path
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground',
        ]"
        @click="editorStore.setActiveFile(file.path)"
      >
        {{ file.path.split('/').pop() }}
      </button>
      <div class="ml-auto shrink-0">
        <Button
          v-if="editorStore.activeFile"
          variant="ghost"
          size="sm"
          @click="saveFile"
          :disabled="editorStore.isGenerating"
        >
          Save
        </Button>
      </div>
    </div>

    <!-- Editor -->
    <div class="flex-1 relative">
      <component
        v-if="VueMonacoEditor && editorStore.activeFile"
        :is="VueMonacoEditor"
        :value="editorContent"
        :language="language"
        :options="{
          readOnly: editorStore.isGenerating,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }"
        theme="vs-dark"
        @change="handleEditorChange"
        class="h-full"
      />
      <div v-else-if="!editorStore.activeFile" class="flex items-center justify-center h-full text-muted-foreground">
        <p>No file selected. Send a prompt to generate code.</p>
      </div>
      <div v-else class="flex items-center justify-center h-full text-muted-foreground">
        <p>Loading editor...</p>
      </div>
    </div>
  </div>
</template>
