import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login',    name: 'login',    component: () => import('@/views/LoginView.vue'),    meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  { path: '/',         name: 'home',      component: () => import('@/views/HomeView.vue'),     meta: { auth: true } },
  { path: '/exercises',name: 'exercises', component: () => import('@/views/ExercisesView.vue'),meta: { auth: true } },
  { path: '/plans',    name: 'plans',     component: () => import('@/views/PlansView.vue'),    meta: { auth: true } },
  { path: '/checklist',name: 'checklist', component: () => import('@/views/ChecklistView.vue'),meta: { auth: true } },
  { path: '/stats',    name: 'stats',     component: () => import('@/views/StatsView.vue'),    meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const token = localStorage.getItem('df_token')
  if (to.meta.auth && !token) return { name: 'login' }
  if (to.meta.guest && token)  return { name: 'home' }
})

export default router
