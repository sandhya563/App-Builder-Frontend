<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  filename: string
  size?: number
}>()

const iconSize = computed(() => props.size || 14)

const iconData = computed(() => {
  const name = props.filename.toLowerCase()

  if (name.endsWith('.html') || name.endsWith('.htm'))
    return { color: '#E44D26', letter: '' , svg: 'html' }
  if (name.endsWith('.css'))
    return { color: '#1572B6', letter: '', svg: 'css' }
  if (name.endsWith('.js') || name.endsWith('.mjs'))
    return { color: '#F7DF1E', letter: '', svg: 'js' }
  if (name.endsWith('.ts') || name.endsWith('.mts'))
    return { color: '#3178C6', letter: '', svg: 'ts' }
  if (name.endsWith('.vue'))
    return { color: '#42B883', letter: '', svg: 'vue' }
  if (name.endsWith('.json'))
    return { color: '#F5A623', letter: '', svg: 'json' }
  if (name.endsWith('.md'))
    return { color: '#519ABA', letter: '', svg: 'md' }
  if (name.endsWith('.svg'))
    return { color: '#FFB13B', letter: '', svg: 'svg' }
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp'))
    return { color: '#A074C4', letter: '', svg: 'img' }
  if (name.endsWith('.env') || name.startsWith('.env'))
    return { color: '#ECD53F', letter: '', svg: 'env' }
  if (name.endsWith('.gitignore'))
    return { color: '#F05032', letter: '', svg: 'git' }
  if (name.endsWith('.yaml') || name.endsWith('.yml'))
    return { color: '#CB171E', letter: '', svg: 'yaml' }
  if (name.endsWith('.jsx') || name.endsWith('.tsx'))
    return { color: '#61DAFB', letter: '', svg: 'react' }
  if (name.endsWith('.scss') || name.endsWith('.sass'))
    return { color: '#CC6699', letter: '', svg: 'sass' }

  return { color: '#8E8E93', letter: '', svg: 'file' }
})
</script>

<template>
  <!-- HTML -->
  <svg v-if="iconData.svg === 'html'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="9" font-weight="700" font-family="monospace">H</text>
  </svg>

  <!-- CSS -->
  <svg v-else-if="iconData.svg === 'css'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="8" font-weight="700" font-family="monospace">#</text>
  </svg>

  <!-- JavaScript -->
  <svg v-else-if="iconData.svg === 'js'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#F7DF1E" fill-opacity="0.2"/>
    <text x="12" y="16" text-anchor="middle" fill="#B8A000" font-size="9" font-weight="700" font-family="monospace">JS</text>
  </svg>

  <!-- TypeScript -->
  <svg v-else-if="iconData.svg === 'ts'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#3178C6" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" fill="#3178C6" font-size="9" font-weight="700" font-family="monospace">TS</text>
  </svg>

  <!-- Vue -->
  <svg v-else-if="iconData.svg === 'vue'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#42B883" fill-opacity="0.15"/>
    <path d="M12 5L7 14h2.5L12 9.5 14.5 14H17L12 5Z" fill="#42B883"/>
    <path d="M12 7.5L9.5 12.5h1.5L12 10.5l1 2h1.5L12 7.5Z" fill="#35495E"/>
  </svg>

  <!-- JSON -->
  <svg v-else-if="iconData.svg === 'json'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="7" font-weight="700" font-family="monospace">{}</text>
  </svg>

  <!-- Markdown -->
  <svg v-else-if="iconData.svg === 'md'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="9" font-weight="700" font-family="monospace">M</text>
  </svg>

  <!-- SVG -->
  <svg v-else-if="iconData.svg === 'svg'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <circle cx="12" cy="12" r="4" stroke="#FFB13B" stroke-width="2" fill="none"/>
  </svg>

  <!-- Image -->
  <svg v-else-if="iconData.svg === 'img'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <path d="M6 17l4-5 3 3.5 2-2.5 3 4H6z" :fill="iconData.color" fill-opacity="0.7"/>
    <circle cx="9" cy="9" r="2" :fill="iconData.color" fill-opacity="0.7"/>
  </svg>

  <!-- Env -->
  <svg v-else-if="iconData.svg === 'env'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <path d="M12 7v4M12 15v2" stroke="#B8A000" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="6" stroke="#B8A000" stroke-width="1.5" fill="none"/>
  </svg>

  <!-- Git -->
  <svg v-else-if="iconData.svg === 'git'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <circle cx="12" cy="12" r="3" stroke="#F05032" stroke-width="2" fill="none"/>
    <path d="M12 6v3M12 15v3M6 12h3M15 12h3" stroke="#F05032" stroke-width="1.5" stroke-linecap="round"/>
  </svg>

  <!-- YAML -->
  <svg v-else-if="iconData.svg === 'yaml'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="7" font-weight="700" font-family="monospace">Y</text>
  </svg>

  <!-- React (JSX/TSX) -->
  <svg v-else-if="iconData.svg === 'react'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <circle cx="12" cy="12" r="2" :fill="iconData.color"/>
    <ellipse cx="12" cy="12" rx="7" ry="3" stroke="#61DAFB" stroke-width="1" fill="none"/>
    <ellipse cx="12" cy="12" rx="7" ry="3" stroke="#61DAFB" stroke-width="1" fill="none" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="7" ry="3" stroke="#61DAFB" stroke-width="1" fill="none" transform="rotate(120 12 12)"/>
  </svg>

  <!-- Sass -->
  <svg v-else-if="iconData.svg === 'sass'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" :fill="iconData.color" fill-opacity="0.15"/>
    <text x="12" y="16" text-anchor="middle" :fill="iconData.color" font-size="8" font-weight="700" font-family="monospace">S</text>
  </svg>

  <!-- Default file -->
  <svg v-else :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#8E8E93" stroke-width="1.5" fill="#8E8E93" fill-opacity="0.1"/>
    <path d="M14 2v6h6" stroke="#8E8E93" stroke-width="1.5"/>
  </svg>
</template>
