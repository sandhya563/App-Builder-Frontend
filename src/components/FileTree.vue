<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import FileTreeItem from './FileTreeItem.vue'

const editorStore = useEditorStore()
const projectsStore = useProjectsStore()

interface TreeNode {
  name: string
  path: string
  isFolder: boolean
  children: TreeNode[]
}

// Track which folders are expanded
const expandedFolders = ref<Set<string>>(new Set(['__root__']))

function toggleFolder(path: string) {
  if (expandedFolders.value.has(path)) {
    expandedFolders.value.delete(path)
  } else {
    expandedFolders.value.add(path)
  }
}

// Build tree structure from flat file paths
const fileTree = computed(() => {
  const root: TreeNode[] = []

  const sortedFiles = [...editorStore.files].sort((a, b) =>
    a.path.localeCompare(b.path),
  )

  for (const file of sortedFiles) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const pathSoFar = parts.slice(0, i + 1).join('/')

      const existing = current.find((n) => n.name === part)

      if (existing) {
        current = existing.children
      } else {
        const node: TreeNode = {
          name: part,
          path: isLast ? file.path : pathSoFar,
          isFolder: !isLast,
          children: [],
        }
        current.push(node)
        if (!isLast) {
          expandedFolders.value.add(pathSoFar)
        }
        current = node.children
      }
    }
  }

  return root
})

const projectName = computed(() => projectsStore.currentProject?.name || 'Project')

function selectFile(node: TreeNode) {
  if (!node.isFolder) {
    editorStore.setActiveFile(node.path)
  }
}
</script>

<template>
  <div class="text-sm select-none py-1">
    <div v-if="editorStore.files.length === 0" class="px-3 py-4 text-muted-foreground text-xs text-center">
      No files yet
    </div>
    <template v-else>
      <!-- Root project folder -->
      <div
        class="px-2 py-1.5 flex items-center gap-1.5 cursor-pointer hover:bg-muted rounded mx-1 transition-colors"
        @click="toggleFolder('__root__')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0 transition-transform"
          :class="expandedFolders.has('__root__') ? 'rotate-90' : ''"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#E8A838" fill-opacity="0.3" stroke="#E8A838" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        <span class="text-xs font-semibold truncate">{{ projectName }}</span>
      </div>

      <!-- Tree contents (inside root) -->
      <div v-show="expandedFolders.has('__root__')" class="pl-1">
        <FileTreeItem
          v-for="node in fileTree"
          :key="node.path"
          :node="node"
          :depth="1"
          :expanded-folders="expandedFolders"
          :active-file="editorStore.activeFile"
          @select="selectFile"
          @toggle="toggleFolder"
        />
      </div>
    </template>
  </div>
</template>
