import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>(
  (localStorage.getItem('theme') as Theme) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
)

// Apply theme to document
function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  localStorage.setItem('theme', t)
}

// Initialize on first load
applyTheme(theme.value)

watch(theme, applyTheme)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
