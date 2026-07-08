<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left panel - Illustration -->
    <div class="hidden lg:flex lg:w-1/2 bg-primary/5 relative overflow-hidden items-center justify-center p-12">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <!-- Floating shapes -->
      <div class="absolute top-20 left-20 w-20 h-20 bg-primary/10 rounded-2xl rotate-12 animate-float"></div>
      <div class="absolute bottom-32 right-20 w-16 h-16 bg-primary/8 rounded-full animate-float-delayed"></div>
      <div class="absolute top-1/3 right-32 w-12 h-12 bg-primary/5 rounded-lg -rotate-6 animate-float"></div>

      <!-- Main illustration -->
      <div class="relative z-10 text-center max-w-md">
        <!-- App builder illustration -->
        <div class="mb-8 relative">
          <div class="w-64 h-48 mx-auto bg-background rounded-xl shadow-2xl border overflow-hidden">
            <!-- Mock app builder UI -->
            <div class="h-6 bg-muted border-b flex items-center px-2 gap-1">
              <div class="w-2 h-2 rounded-full bg-red-400"></div>
              <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div class="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div class="flex h-[calc(100%-24px)]">
              <div class="w-1/3 border-r p-2 space-y-1.5">
                <div class="h-2 bg-primary/20 rounded w-full"></div>
                <div class="h-2 bg-muted rounded w-3/4"></div>
                <div class="h-2 bg-muted rounded w-5/6"></div>
                <div class="h-6 mt-2 bg-primary/10 rounded"></div>
                <div class="h-2 bg-muted rounded w-2/3"></div>
              </div>
              <div class="w-1/3 p-2 space-y-1">
                <div class="h-1.5 bg-primary/30 rounded w-full"></div>
                <div class="h-1.5 bg-primary/20 rounded w-4/5"></div>
                <div class="h-1.5 bg-primary/10 rounded w-full"></div>
                <div class="h-1.5 bg-primary/20 rounded w-3/4"></div>
                <div class="h-1.5 bg-primary/10 rounded w-5/6"></div>
                <div class="h-1.5 bg-primary/30 rounded w-2/3"></div>
                <div class="h-1.5 bg-primary/10 rounded w-full"></div>
              </div>
              <div class="w-1/3 border-l p-2">
                <div class="h-full bg-gradient-to-b from-primary/5 to-primary/15 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-primary/40"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Sparkle decorations -->
          <div class="absolute -top-4 -right-4 text-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div class="absolute -bottom-2 -left-6 text-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-3">Build apps with AI</h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Describe what you want and watch your HighLevel marketplace app come to life in real-time.
        </p>

        <!-- Feature pills -->
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <span class="px-3 py-1 bg-background border rounded-full text-xs text-muted-foreground">⚡ Real-time generation</span>
          <span class="px-3 py-1 bg-background border rounded-full text-xs text-muted-foreground">🔗 HighLevel APIs</span>
          <span class="px-3 py-1 bg-background border rounded-full text-xs text-muted-foreground">👁️ Live preview</span>
        </div>
      </div>
    </div>

    <!-- Right panel - Login form -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-sm">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-foreground">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Welcome back</h1>
          <p class="text-muted-foreground text-sm mt-1">Sign in to your App Builder account</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Email</label>
            <Input v-model="email" type="email" placeholder="you@example.com" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Password</label>
            <Input v-model="password" type="password" placeholder="••••••••" />
          </div>

          <p v-if="error" class="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{{ error }}</p>

          <Button class="w-full h-11" :disabled="loading">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-border"></div>
          <span class="text-xs text-muted-foreground">or</span>
          <div class="flex-1 h-px bg-border"></div>
        </div>

        <!-- Sign up link -->
        <p class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <router-link to="/register" class="text-primary font-medium hover:underline">
            Create one
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-10px) rotate(12deg); }
}
@keyframes float-delayed {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float-delayed 5s ease-in-out infinite;
  animation-delay: 1s;
}
</style>
