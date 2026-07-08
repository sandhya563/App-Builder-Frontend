<script setup lang="ts">
import FileIcon from './FileIcon.vue'

interface TreeNode {
  name: string
  path: string
  isFolder: boolean
  children: TreeNode[]
}

const props = defineProps<{
  node: TreeNode
  depth: number
  expandedFolders: Set<string>
  activeFile: string | null
}>()

const emit = defineEmits<{
  select: [node: TreeNode]
  toggle: [path: string]
}>()
</script>

<template>
  <div>
    <!-- Folder node -->
    <div v-if="node.isFolder">
      <div
        class="px-2 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-muted rounded transition-colors"
        :style="{ paddingLeft: depth * 12 + 4 + 'px' }"
        @click="emit('toggle', node.path)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0 transition-transform"
          :class="expandedFolders.has(node.path) ? 'rotate-90' : ''"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <!-- Folder icon -->
        <svg v-if="expandedFolders.has(node.path)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#E8A838" fill-opacity="0.3" stroke="#E8A838" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#E8A838" fill-opacity="0.2" stroke="#C89030" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        <span class="text-xs truncate">{{ node.name }}</span>
      </div>
      <div v-show="expandedFolders.has(node.path)">
        <FileTreeItem
          v-for="child in node.children"
          :key="child.path"
          :node="child"
          :depth="depth + 1"
          :expanded-folders="expandedFolders"
          :active-file="activeFile"
          @select="emit('select', $event)"
          @toggle="emit('toggle', $event)"
        />
      </div>
    </div>
    <!-- File node -->
    <div
      v-else
      :class="[
        'px-2 py-1 rounded cursor-pointer text-xs flex items-center gap-1.5 transition-colors',
        activeFile === node.path
          ? 'bg-primary/15 text-foreground'
          : 'hover:bg-muted text-foreground',
      ]"
      :style="{ paddingLeft: depth * 12 + 18 + 'px' }"
      @click="emit('select', node)"
    >
      <FileIcon :filename="node.name" :size="14" class="shrink-0" />
      <span class="truncate">{{ node.name }}</span>
    </div>
  </div>
</template>
