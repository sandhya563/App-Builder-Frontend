<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  direction?: 'horizontal' | 'vertical'
}>()

const emit = defineEmits<{
  resize: [delta: number]
}>()

const isDragging = ref(false)

function onMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true

  const startX = e.clientX
  const startY = e.clientY

  function onMouseMove(e: MouseEvent) {
    const delta =
      props.direction === 'vertical'
        ? e.clientY - startY
        : e.clientX - startX
    emit('resize', delta)
  }

  function onMouseUp() {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor =
    props.direction === 'vertical' ? 'row-resize' : 'col-resize'
  document.body.style.userSelect = 'none'
}
</script>

<template>
  <div
    :class="[
      'shrink-0 bg-border hover:bg-primary/20 transition-colors relative z-10',
      direction === 'vertical'
        ? 'h-1 cursor-row-resize w-full'
        : 'w-1 cursor-col-resize h-full',
      isDragging ? 'bg-primary/30' : '',
    ]"
    @mousedown="onMouseDown"
  >
    <div
      :class="[
        'absolute inset-0',
        direction === 'vertical' ? '-top-1 -bottom-1' : '-left-1 -right-1',
      ]"
    />
  </div>
</template>
