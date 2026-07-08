import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import api from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const hlConnected = ref(false)
  const hlLocationId = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  // Listen to auth state
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
    loading.value = false
    if (firebaseUser) {
      checkHighLevelStatus()
    }
  })

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    user.value = result.user
  }

  async function register(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    user.value = result.user
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    hlConnected.value = false
    hlLocationId.value = null
  }

  async function connectHighLevel() {
    const { data } = await api.get('/auth/highlevel/connect')
    window.location.href = data.data.url
  }

  async function checkHighLevelStatus() {
    try {
      const { data } = await api.get('/auth/highlevel/status')
      hlConnected.value = data.data.connected
      hlLocationId.value = data.data.locationId || null
    } catch {
      hlConnected.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    hlConnected,
    hlLocationId,
    login,
    register,
    logout,
    connectHighLevel,
    checkHighLevelStatus,
  }
})
