<template>
  <div class="min-h-screen bg-stone-950 flex items-center justify-center px-4">
    <!-- Background glow -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10" style="background:radial-gradient(circle,#dc2626,transparent)"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10" style="background:radial-gradient(circle,#ea580c,transparent)"></div>
    </div>

    <div class="w-full max-w-sm relative">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-fire-grad shadow-fire mb-4">
          <Zap class="text-white" :size="28" />
        </div>
        <h1 class="font-display text-5xl tracking-widest text-fire-grad">DAILYFIT</h1>
        <p class="text-stone-500 text-sm mt-1">Track your gains. Level up.</p>
      </div>

      <!-- Card -->
      <div class="bg-stone-900 border border-stone-800/60 rounded-2xl p-6">
        <h2 class="font-display text-2xl tracking-wider text-white mb-5">SIGN IN</h2>

        <div v-if="error" class="bg-red-950/50 border border-red-800/40 text-red-400 text-sm px-3 py-2.5 rounded-xl mb-4">
          {{ error }}
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Email</label>
            <input v-model="form.email" type="email" required placeholder="you@example.com"
              class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Password</label>
            <div class="relative">
              <input v-model="form.password" :type="showPw ? 'text' : 'password'" required placeholder="••••••••"
                class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all pr-10" />
              <button type="button" @click="showPw = !showPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                <Eye v-if="!showPw" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-fire-grad text-white font-black py-3 rounded-xl shadow-fire hover:shadow-fire-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ loading ? 'Signing in...' : 'SIGN IN' }}
          </button>
        </form>

        <p class="text-center text-sm text-stone-500 mt-5">
          Belum punya akun?
          <RouterLink to="/register" class="text-ember-400 font-bold hover:text-ember-300 transition-colors">Daftar sekarang</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Zap, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const auth   = useAuthStore()

const form   = ref({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPw  = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/')
  } catch (e) {
    error.value = e?.message || 'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>
