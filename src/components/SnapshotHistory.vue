<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const editorStore = useEditorStore()
const isOpen = ref(false)
const restoring = ref<string | null>(null)

async function restore(snapshotId: string) {
  restoring.value = snapshotId
  try {
    await editorStore.restoreSnapshot(snapshotId)
  } finally {
    restoring.value = null
  }
}
</script>

<template>
  <div class="relative">
    <Button variant="outline" size="sm" @click="isOpen = !isOpen">
      Snapshots ({{ editorStore.snapshots.length }})
    </Button>

    <!-- Dropdown panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-80 z-50 animate-scale-in"
    >
      <Card class="p-4 max-h-96 overflow-y-auto shadow-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-sm">Snapshot History</h3>
          <Button variant="ghost" size="sm" @click="editorStore.createSnapshot()">
            + Create
          </Button>
        </div>

        <div v-if="editorStore.snapshots.length === 0" class="text-center text-muted-foreground text-sm py-4">
          No snapshots yet. They are created automatically during generation.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="snapshot in editorStore.snapshots"
            :key="snapshot.id"
            class="flex items-center justify-between p-2 rounded hover:bg-muted"
          >
            <div>
              <p class="text-xs font-mono">{{ snapshot.id.slice(0, 8) }}...</p>
              <p class="text-xs text-muted-foreground">
                {{ new Date(snapshot.createdAt).toLocaleString() }}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              :disabled="restoring === snapshot.id"
              @click="restore(snapshot.id)"
            >
              {{ restoring === snapshot.id ? '...' : 'Restore' }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
