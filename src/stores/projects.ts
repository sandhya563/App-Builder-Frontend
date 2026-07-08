import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'

export interface Project {
  id: string
  name: string
  description: string
  locationId: string | null
  files: string[]
  createdAt: string
  updatedAt: string
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    try {
      const { data } = await api.get('/projects')
      projects.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: string) {
    loading.value = true
    try {
      const { data } = await api.get(`/projects/${id}`)
      currentProject.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function createProject(name: string, description?: string) {
    const { data } = await api.post('/projects', { name, description })
    projects.value.unshift(data.data)
    return data.data
  }

  async function deleteProject(id: string) {
    await api.delete(`/projects/${id}`)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  async function updateProject(id: string, updates: { name?: string; description?: string }) {
    const { data: res } = await api.patch(`/projects/${id}`, updates)
    const idx = projects.value.findIndex((p) => p.id === id)
    if (idx >= 0) {
      projects.value[idx] = { ...projects.value[idx], ...updates }
    }
    if (currentProject.value?.id === id) {
      currentProject.value = { ...currentProject.value, ...updates }
    }
    return res.data
  }

  return {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
})
