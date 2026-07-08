<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { timeAgo } from '@/lib/timeago'
import { useTheme } from '@/composables/useTheme'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import ProjectPreviewCard from '@/components/ProjectPreviewCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const { theme, toggleTheme } = useTheme()

const showCreateDialog = ref(false)
const showProfileMenu = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')

// User initials for avatar
const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.slice(0, 2).toUpperCase()
})

// Edit state
const editingProject = ref<string | null>(null)
const editName = ref('')
const editDescription = ref('')

// Delete confirmation
const deletingProject = ref<string | null>(null)

onMounted(() => {
  projectsStore.fetchProjects()
})

async function createProject() {
  if (!newProjectName.value.trim()) return
  const project = await projectsStore.createProject(
    newProjectName.value,
    newProjectDescription.value,
  )
  showCreateDialog.value = false
  newProjectName.value = ''
  newProjectDescription.value = ''
  router.push(`/project/${project.id}`)
}

function openProject(id: string) {
  if (editingProject.value === id || deletingProject.value === id) return
  router.push(`/project/${id}`)
}

function startEditing(project: any, e: Event) {
  e.stopPropagation()
  editingProject.value = project.id
  editName.value = project.name
  editDescription.value = project.description || ''
}

async function saveEdit() {
  if (!editName.value.trim() || !editingProject.value) return
  await projectsStore.updateProject(editingProject.value, {
    name: editName.value.trim(),
    description: editDescription.value.trim(),
  })
  editingProject.value = null
}

function cancelEdit(e?: Event) {
  if (e) e.stopPropagation()
  editingProject.value = null
}

function confirmDelete(id: string, e: Event) {
  e.stopPropagation()
  deletingProject.value = id
}

async function handleDelete(id: string, e: Event) {
  e.stopPropagation()
  await projectsStore.deleteProject(id)
  deletingProject.value = null
}

function cancelDelete(e: Event) {
  e.stopPropagation()
  deletingProject.value = null
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b">
      <div class="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
        <h1 class="text-lg md:text-xl font-bold shrink-0">App Builder</h1>
        <div class="flex items-center gap-3">
          <!-- HL Status badge -->
          <Badge :variant="authStore.hlConnected ? 'default' : 'outline'" class="text-[10px] md:text-xs hidden sm:inline-flex">
            {{ authStore.hlConnected ? `Connected` : 'HL: Not Connected' }}
          </Badge>

          <!-- Profile Avatar + Dropdown -->
          <div class="relative">
            <button
              class="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-primary/20"
              @click="showProfileMenu = !showProfileMenu"
            >
              {{ userInitials }}
            </button>

            <!-- Dropdown -->
            <div
              v-if="showProfileMenu"
              class="absolute right-0 top-full mt-2 w-64 bg-background border rounded-xl shadow-xl z-50 overflow-hidden animate-in"
            >
              <!-- User info -->
              <div class="px-4 py-3 border-b">
                <p class="text-sm font-medium truncate">{{ authStore.user?.email }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ authStore.hlConnected ? `Location: ${authStore.hlLocationId}` : 'HighLevel not connected' }}
                </p>
              </div>

              <!-- Menu items -->
              <div class="py-1">
                <!-- Connect HighLevel -->
                <button
                  v-if="!authStore.hlConnected"
                  class="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-3 transition-colors"
                  @click="authStore.connectHighLevel(); showProfileMenu = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                  Connect HighLevel
                </button>

                <!-- Theme toggle -->
                <button
                  class="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-3 transition-colors"
                  @click="toggleTheme(); showProfileMenu = false"
                >
                  <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                  {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
                </button>

                <div class="border-t my-1"></div>

                <!-- Logout -->
                <button
                  class="w-full px-4 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-3 transition-colors text-destructive"
                  @click="handleLogout(); showProfileMenu = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Logout
                </button>
              </div>
            </div>

            <!-- Click outside to close -->
            <div
              v-if="showProfileMenu"
              class="fixed inset-0 z-40"
              @click="showProfileMenu = false"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl md:text-2xl font-semibold">Projects</h2>
        <Button @click="showCreateDialog = true" size="sm" class="md:size-default">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span class="hidden sm:inline">New Project</span>
          <span class="sm:hidden">New</span>
        </Button>
      </div>

      <!-- Create Project Modal -->
      <Teleport to="body">
        <div v-if="showCreateDialog" class="fixed inset-0 z-50 flex items-center justify-center">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateDialog = false"></div>
          <!-- Modal -->
          <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md mx-4 animate-in">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Create New Project</h3>
              <button
                class="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                @click="showCreateDialog = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <!-- Body -->
            <form @submit.prevent="createProject" class="px-6 py-5 space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Project Name</label>
                <Input v-model="newProjectName" placeholder="My Dashboard App" autofocus />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Description <span class="text-muted-foreground font-normal">(optional)</span></label>
                <Input v-model="newProjectDescription" placeholder="A contact dashboard that shows..." />
              </div>
              <!-- Footer -->
              <div class="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" @click="showCreateDialog = false">Cancel</Button>
                <Button type="submit" :disabled="!newProjectName.trim()">Create Project</Button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit Project Modal -->
      <Teleport to="body">
        <div v-if="editingProject" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelEdit()"></div>
          <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md mx-4 animate-in">
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Edit Project</h3>
              <button
                class="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                @click="cancelEdit()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form @submit.prevent="saveEdit" class="px-6 py-5 space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Project Name</label>
                <Input v-model="editName" placeholder="Project name" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Description <span class="text-muted-foreground font-normal">(optional)</span></label>
                <Input v-model="editDescription" placeholder="A brief description..." />
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" @click="cancelEdit()">Cancel</Button>
                <Button type="submit" :disabled="!editName.trim()">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Projects Grid -->
      <div v-if="projectsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="n in 6" :key="n" class="overflow-hidden">
          <Skeleton class="h-32 w-full" />
          <div class="p-4">
            <Skeleton class="h-5 w-3/4 mb-3" />
            <Skeleton class="h-4 w-full mb-2" />
            <Skeleton class="h-4 w-1/2 mb-4" />
            <div class="flex items-center gap-2">
              <Skeleton class="h-5 w-16 rounded-full" />
              <Skeleton class="h-3 w-20" />
            </div>
          </div>
        </Card>
      </div>
      <div v-else-if="projectsStore.projects.length === 0" class="text-center py-12 text-muted-foreground">
        No projects yet. Create one to get started.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <Card
          v-for="project in projectsStore.projects"
          :key="project.id"
          class="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
          @click="openProject(project.id)"
        >
          <!-- Preview thumbnail -->
          <ProjectPreviewCard :project-id="project.id" :has-files="project.files.length > 0" />

          <!-- Card content -->
          <div class="p-4">
            <!-- Delete confirmation overlay -->
            <div v-if="deletingProject === project.id" class="absolute inset-0 bg-background/95 rounded-lg flex flex-col items-center justify-center gap-3 z-10 p-4">
              <p class="text-sm text-center">Delete <strong>{{ project.name }}</strong>?</p>
              <div class="flex gap-2">
                <Button variant="destructive" size="sm" @click="handleDelete(project.id, $event)">Delete</Button>
                <Button variant="outline" size="sm" @click="cancelDelete($event)">Cancel</Button>
              </div>
            </div>

            <!-- Project name -->
            <h3 class="font-semibold">{{ project.name }}</h3>

            <p class="text-sm text-muted-foreground mt-1 line-clamp-1">{{ project.description || 'No description' }}</p>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-2">
                <Badge variant="secondary">{{ project.files.length }} files</Badge>
              </div>
              <!-- Actions -->
              <div class="flex gap-1">
                <button
                  class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit"
                  @click="startEditing(project, $event)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                </button>
                <button
                  class="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                  @click="confirmDelete(project.id, $event)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
            <!-- Timestamps -->
            <div class="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              <span title="Created">Created {{ timeAgo(project.createdAt) }}</span>
              <span v-if="project.updatedAt !== project.createdAt" title="Last updated">· Updated {{ timeAgo(project.updatedAt) }}</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>
