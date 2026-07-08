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
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  try {
    await authStore.register(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Registration failed'
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
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <!-- Floating shapes -->
      <div class="absolute top-32 right-24 w-24 h-24 bg-primary/8 rounded-3xl -rotate-12 animate-float"></div>
      <div class="absolute bottom-24 left-16 w-14 h-14 bg-primary/10 rounded-full animate-float-delayed"></div>
      <div class="absolute top-1/4 left-28 w-10 h-10 bg-primary/6 rounded-lg rotate-45 animate-float"></div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-md">
        <!-- Steps illustration -->
        <div class="mb-8 space-y-3">
          <div class="flex items-center gap-3 bg-background border rounded-xl px-4 py-3 shadow-sm max-w-xs mx-auto">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-primary">1</span>
            </div>
            <div class="text-left">
              <p class="text-xs font-medium">Describe your app</p>
              <p class="text-[10px] text-muted-foreground">Tell AI what you want to build</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-background border rounded-xl px-4 py-3 shadow-sm max-w-xs mx-auto translate-x-4">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-primary">2</span>
            </div>
            <div class="text-left">
              <p class="text-xs font-medium">Watch it generate</p>
              <p class="text-[10px] text-muted-foreground">Real-time code streaming</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-background border rounded-xl px-4 py-3 shadow-sm max-w-xs mx-auto">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-primary">3</span>
            </div>
            <div class="text-left">
              <p class="text-xs font-medium">Preview & deploy</p>
              <p class="text-[10px] text-muted-foreground">See live results instantly</p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-3">Start building in seconds</h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Create your free account and start generating HighLevel marketplace apps with AI.
        </p>
      </div>
    </div>

    <!-- Right panel - Register form -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-sm">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-foreground">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Create your account</h1>
          <p class="text-muted-foreground text-sm mt-1">Get started with App Builder for free</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Email</label>
            <Input v-model="email" type="email" placeholder="you@example.com" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Password</label>
            <Input v-model="password" type="password" placeholder="Min. 6 characters" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Confirm Password</label>
            <Input v-model="confirmPassword" type="password" placeholder="••••••••" />
          </div>

          <p v-if="error" class="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{{ error }}</p>

          <Button class="w-full h-11" :disabled="loading">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-border"></div>
          <span class="text-xs text-muted-foreground">or</span>
          <div class="flex-1 h-px bg-border"></div>
        </div>

        <!-- Sign in link -->
        <p class="text-center text-sm text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-primary font-medium hover:underline">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-12deg); }
  50% { transform: translateY(-10px) rotate(-12deg); }
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
