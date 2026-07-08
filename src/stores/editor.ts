import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'

export interface FileEntry {
  path: string
  content: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Snapshot {
  id: string
  createdAt: string
  fileCount?: number
}

export const useEditorStore = defineStore('editor', () => {
  const projectId = ref<string>('')
  const files = ref<FileEntry[]>([])
  const activeFile = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const snapshots = ref<Snapshot[]>([])
  const isGenerating = ref(false)
  const streamContent = ref('')
  let abortController: AbortController | null = null

  const activeFileContent = computed(() => {
    const file = files.value.find((f) => f.path === activeFile.value)
    return file?.content || ''
  })

  function setProjectId(id: string) {
    projectId.value = id
  }

  async function fetchFiles() {
    const { data } = await api.get(`/projects/${projectId.value}/files`)
    const filePaths: string[] = data.data

    // Load content for each file
    const fileEntries: FileEntry[] = []
    for (const path of filePaths) {
      try {
        const { data: fileData } = await api.get(
          `/projects/${projectId.value}/files/content`,
          { params: { path } },
        )
        fileEntries.push({ path, content: fileData.data.content })
      } catch {
        fileEntries.push({ path, content: '' })
      }
    }
    files.value = fileEntries
    if (fileEntries.length > 0 && !activeFile.value) {
      activeFile.value = fileEntries[0].path
    }
  }

  async function saveFile(path: string, content: string) {
    await api.post(`/projects/${projectId.value}/files`, { path, content })
    const idx = files.value.findIndex((f) => f.path === path)
    if (idx >= 0) {
      files.value[idx].content = content
    } else {
      files.value.push({ path, content })
    }
  }

  async function fetchChatHistory() {
    const { data } = await api.get(
      `/projects/${projectId.value}/chat/history`,
    )
    messages.value = data.data
  }

  async function sendMessage(message: string) {
    isGenerating.value = true
    streamContent.value = ''
    abortController = new AbortController()

    // Add user message to UI immediately
    messages.value.push({
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    })

    try {
      const token = await auth.currentUser?.getIdToken()
      const baseUrl = import.meta.env.VITE_API_URL || '/api'

      const response = await fetch(
        `${baseUrl}/projects/${projectId.value}/chat/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
          signal: abortController.signal,
        },
      )

      if (!response.ok) {
        let errorMessage = 'Generation failed. Please try again.'
        try {
          const responseText = await response.text()
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText)
            if (errorData.message) {
              errorMessage = errorData.message
            } else if (errorData.error?.message) {
              errorMessage = errorData.error.message
            }
          } catch {
            // Not JSON, check if it contains a JSON-like structure within the text
            const jsonMatch = responseText.match(/\{.*\}/)
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0])
                errorMessage = parsed.error?.message || parsed.message || errorMessage
              } catch {
                // ignore
              }
            }
          }
        } catch {
          if (response.status === 404) {
            errorMessage = 'The AI model is currently unavailable. Please try again later or contact support.'
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.'
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.'
          }
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let buffer = ''
      let currentEvent = 'token'

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)
            try {
              const eventData = JSON.parse(jsonStr)
              handleSSEEvent(currentEvent, eventData)
            } catch {
              // ignore parse errors
            }
          }
          // empty line resets event (SSE spec)
          if (line === '') {
            currentEvent = 'token'
          }
        }
      }

      // Add assistant message
      if (streamContent.value) {
        messages.value.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: streamContent.value,
          createdAt: new Date().toISOString(),
        })
      }

      // Refresh files after generation
      await fetchFiles()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Generation was cancelled by user
        if (streamContent.value) {
          messages.value.push({
            id: Date.now().toString(),
            role: 'assistant',
            content: streamContent.value + '\n\n⚠️ Generation cancelled.',
            createdAt: new Date().toISOString(),
          })
        }
        await fetchFiles()
      } else {
        console.error('Generation error:', error)
        messages.value.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ ${error.message || 'Something went wrong. Please try again.'}`,
          createdAt: new Date().toISOString(),
        })
      }
    } finally {
      isGenerating.value = false
      streamContent.value = ''
      abortController = null
    }
  }

  function cancelGeneration() {
    if (abortController) {
      abortController.abort()
    }
  }

  function handleSSEEvent(type: string, data: any) {
    switch (type) {
      case 'token':
        streamContent.value += data.content
        break
      case 'file':
        // File was saved - will be fetched after completion
        break
      case 'complete':
        break
      case 'error': {
        // Extract a clean error message
        let errorMsg = data.message || 'Something went wrong. Please try again.'
        // If the message contains a JSON object (possibly prefixed with status code), extract readable message
        if (typeof errorMsg === 'string') {
          const jsonMatch = errorMsg.match(/\{.*\}/)
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0])
              errorMsg = parsed.error?.message || parsed.message || 'Something went wrong. Please try again.'
            } catch {
              // Keep original message if parsing fails, but strip any status code prefix
              errorMsg = errorMsg.replace(/^\d{3}\s*/, '').trim() || 'Something went wrong. Please try again.'
            }
          }
        }
        messages.value.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          createdAt: new Date().toISOString(),
        })
        isGenerating.value = false
        streamContent.value = ''
        break
      }
    }
  }

  async function fetchSnapshots() {
    const { data } = await api.get(
      `/projects/${projectId.value}/snapshots`,
    )
    snapshots.value = data.data
  }

  async function createSnapshot() {
    await api.post(`/projects/${projectId.value}/snapshots`)
    await fetchSnapshots()
  }

  async function restoreSnapshot(snapshotId: string) {
    await api.post(
      `/projects/${projectId.value}/snapshots/${snapshotId}/restore`,
    )
    await fetchFiles()
    await fetchSnapshots()
  }

  function setActiveFile(path: string) {
    activeFile.value = path
  }

  return {
    projectId,
    files,
    activeFile,
    activeFileContent,
    messages,
    snapshots,
    isGenerating,
    streamContent,
    setProjectId,
    fetchFiles,
    saveFile,
    fetchChatHistory,
    sendMessage,
    cancelGeneration,
    fetchSnapshots,
    createSnapshot,
    restoreSnapshot,
    setActiveFile,
  }
})
