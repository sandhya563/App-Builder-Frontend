<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const message = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isAtBottom = ref(true)

const showScrollButton = computed(() => !isAtBottom.value)

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
  isAtBottom.value = true
}

function onScroll() {
  if (!messagesContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50
}

async function sendMessage() {
  const text = message.value.trim()
  if (!text || editorStore.isGenerating) return
  message.value = ''
  await editorStore.sendMessage(text)
}

// Scroll to bottom on mount (when opening the project)
onMounted(() => {
  setTimeout(scrollToBottom, 100)
  setTimeout(scrollToBottom, 500)
})

// Auto-scroll on new messages or initial load
watch(
  () => editorStore.messages.length,
  async (newLen, oldLen) => {
    await nextTick()
    if (oldLen === 0 || isAtBottom.value) {
      scrollToBottom()
    }
  },
)

watch(
  () => editorStore.streamContent,
  async () => {
    await nextTick()
    if (isAtBottom.value) scrollToBottom()
  },
)

// Format code blocks in messages
function formatMessage(content: string): string {
  // Don't format if it contains raw file markers
  if (content.includes('===FILE:')) {
    const fileMatches = content.match(/===FILE:\s*(.+?)===/g)
    const files = fileMatches
      ? fileMatches.map(m => m.replace(/===FILE:\s*/, '').replace(/===/, '').trim())
      : []

    // Extract any text before the first ===FILE: marker as the explanation
    const beforeFiles = content.split('===FILE:')[0].trim()

    // Extract any text between ===END_FILE=== and next ===FILE: as intermediate explanations
    const explanationParts: string[] = []
    if (beforeFiles) {
      explanationParts.push(beforeFiles)
    }

    // Also check for text after the last ===END_FILE===
    const afterLastFile = content.split('===END_FILE===').pop()?.trim() || ''
    if (afterLastFile && !afterLastFile.includes('===FILE:')) {
      explanationParts.push(afterLastFile)
    }

    const explanation = explanationParts.join('\n\n')

    const fileSummary = files.length > 0
      ? `\n\n📦 Generated ${files.length} file${files.length > 1 ? 's' : ''}:\n${files.map(f => `  • ${f}`).join('\n')}`
      : ''

    return (explanation || 'Here\'s the generated code for your app.') + fileSummary
  }
  return content
}

function getTimeString(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Suggested prompts for empty state
const suggestions = [
  'Build a contact dashboard with search',
  'Create a calendar view with appointments',
  'Build a conversation inbox',
  'Make a simple CRM dashboard',
]
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 py-3 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <h2 class="font-medium text-sm">Chat</h2>
      </div>
      <span v-if="editorStore.isGenerating" class="text-xs text-muted-foreground flex items-center gap-1">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Generating
      </span>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-3 py-4 space-y-4"
      @scroll="onScroll"
    >
      <!-- Empty state with suggestions -->
      <div v-if="editorStore.messages.length === 0 && !editorStore.isGenerating" class="flex flex-col items-center justify-center h-full text-center px-2">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>
        <h3 class="text-sm font-medium mb-1">What would you like to build?</h3>
        <p class="text-xs text-muted-foreground mb-4">Describe your app and AI will generate it</p>
        <div class="space-y-2 w-full stagger-children">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="w-full text-left px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs transition-colors"
            @click="message = suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Message list -->
      <template v-else>
        <div
          v-for="msg in editorStore.messages"
          :key="msg.id"
          class="flex gap-2 animate-fade-in-up"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- Avatar -->
          <div
            v-if="msg.role === 'assistant'"
            class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-primary/10 mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>

          <!-- Message bubble -->
          <div
            :class="[
              'max-w-[85%] rounded-xl px-3 py-2 text-sm break-words',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted rounded-bl-sm',
            ]"
          >
            <p class="whitespace-pre-wrap break-words leading-relaxed">{{ formatMessage(msg.content) }}</p>
            <span
              :class="[
                'text-[10px] mt-1 block',
                msg.role === 'user' ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground',
              ]"
            >
              {{ getTimeString(msg.createdAt) }}
            </span>
          </div>

          <!-- User avatar -->
          <div
            v-if="msg.role === 'user'"
            class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-primary mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-foreground">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>

        <!-- Streaming content -->
        <div v-if="editorStore.isGenerating && editorStore.streamContent" class="flex gap-2 justify-start">
          <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-primary/10 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary animate-spin">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <div class="max-w-[85%] bg-muted rounded-xl rounded-bl-sm px-3 py-2 text-sm break-words">
            <p class="whitespace-pre-wrap break-words leading-relaxed">{{ formatMessage(editorStore.streamContent) }}</p>
            <span class="inline-flex gap-0.5 mt-1">
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </span>
          </div>
        </div>

        <!-- Loading indicator (no stream content yet) -->
        <div v-if="editorStore.isGenerating && !editorStore.streamContent" class="flex gap-2 justify-start">
          <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-primary/10 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <div class="bg-muted rounded-xl rounded-bl-sm px-4 py-3">
            <span class="inline-flex gap-1">
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </span>
          </div>
        </div>

        <!-- Cancel button -->
        <div v-if="editorStore.isGenerating" class="flex justify-center">
          <button
            @click="editorStore.cancelGeneration()"
            class="px-3 py-1.5 text-xs rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="5" y="5" rx="2"/></svg>
            Stop generating
          </button>
        </div>
      </template>
    </div>

    <!-- Scroll to bottom button -->
    <div v-if="showScrollButton" class="relative">
      <button
        @click="scrollToBottom"
        class="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-all hover:scale-110 z-10"
        title="Scroll to bottom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>

    <!-- Input -->
    <div class="p-3 border-t">
      <div class="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
        <!-- Text input -->
        <form @submit.prevent="sendMessage">
          <textarea
            v-model="message"
            placeholder="Describe what to build..."
            :disabled="editorStore.isGenerating"
            rows="1"
            class="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-h-32 overflow-y-auto"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.shift.enter.prevent="message += '\n'"
            @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = Math.min(($event.target as HTMLTextAreaElement).scrollHeight, 128) + 'px'"
          />
          <!-- Bottom toolbar -->
          <div class="flex items-center justify-between px-2 pb-2">
            <div class="flex items-center gap-0.5">
              <button
                class="p-1.5 rounded-md text-muted-foreground/40 cursor-not-allowed hover:text-muted-foreground/60 transition-colors"
                title="Attach file (coming soon)"
                type="button"
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <button
                class="p-1.5 rounded-md text-muted-foreground/40 cursor-not-allowed hover:text-muted-foreground/60 transition-colors"
                title="Upload image (coming soon)"
                type="button"
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </button>
              <button
                class="p-1.5 rounded-md text-muted-foreground/40 cursor-not-allowed hover:text-muted-foreground/60 transition-colors"
                title="Rich text (coming soon)"
                type="button"
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8"/></svg>
              </button>
            </div>
            <button
              type="submit"
              :disabled="editorStore.isGenerating || !message.trim()"
              class="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
                <path d="m21.854 2.147-10.94 10.939"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
      <p class="text-[10px] text-muted-foreground/40 text-center mt-1.5">⏎ send · Shift+⏎ new line</p>
    </div>
  </div>
</template>
