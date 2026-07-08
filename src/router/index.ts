import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/project/:id',
      name: 'Project',
      component: () => import('@/views/ProjectView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Wait for auth to initialize
const getCurrentUser = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject,
    )
  })
}

router.beforeEach(async (to) => {
  const user = await getCurrentUser()

  if (to.meta.requiresAuth && !user) {
    return { name: 'Login' }
  }

  if (to.meta.guest && user) {
    return { name: 'Dashboard' }
  }
})

export default router
