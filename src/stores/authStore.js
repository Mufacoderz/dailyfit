import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('df_user') || 'null'))
  const token = ref(localStorage.getItem('df_token') || '')

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    setSession(data)
    return data
  }

  async function register(name, email, password) {
    const data = await api.post('/auth/register', { name, email, password })
    setSession(data)
    return data
  }

  function setSession({ token: t, user: u }) {
    token.value = t
    user.value  = u
    localStorage.setItem('df_token', t)
    localStorage.setItem('df_user', JSON.stringify(u))
  }

  function logout() {
    token.value = ''
    user.value  = null
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_user')
  }

  async function fetchMe() {
    try {
      const data = await api.get('/auth/me')
      user.value = data.user
      localStorage.setItem('df_user', JSON.stringify(data.user))
    } catch { logout() }
  }

  return { user, token, isLoggedIn, login, register, logout, fetchMe }
})
