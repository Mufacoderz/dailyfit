<template>
  <div class="flex min-h-screen bg-stone-950">
    <!-- SIDEBAR desktop -->
    <aside class="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-stone-950 flex-col z-40 border-r border-stone-800/50">
      <!-- Logo -->
      <div class="px-6 py-7 border-b border-stone-800/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-fire-grad flex items-center justify-center shadow-fire">
            <Zap class="text-white" :size="16" />
          </div>
          <span class="font-display text-2xl tracking-widest text-fire-grad">DAILYFIT</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-gradient-to-r from-fire-600/25 to-ember-600/15 text-white border border-fire-600/25'
            : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800/50'"
        >
          <component :is="item.icon" :size="17" :class="isActive(item.to) ? 'text-ember-500' : ''" />
          {{ item.label }}
          <span v-if="isActive(item.to)" class="ml-auto w-1.5 h-1.5 rounded-full bg-ember-500"></span>
        </RouterLink>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-4 border-t border-stone-800/50 space-y-2">
        <div class="flex items-center gap-3 px-3 py-2.5 bg-stone-900/60 rounded-xl">
          <div class="w-8 h-8 rounded-full bg-fire-grad flex items-center justify-center text-white font-display text-sm flex-shrink-0 shadow-fire">
            {{ auth.user?.name?.[0]?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-white truncate">{{ auth.user?.name }}</div>
            <div class="text-[10px] text-stone-500 truncate">{{ auth.user?.email }}</div>
          </div>
        </div>
        <button @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-900/30 bg-red-950/20 hover:bg-red-900/30 hover:text-red-300 transition-all">
          <LogOut :size="13" /> SIGN OUT
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 md:ml-60">
      <!-- Mobile topbar -->
      <header class="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-stone-950/95 backdrop-blur border-b border-stone-800/50">
        <span class="font-display text-xl tracking-widest text-fire-grad">DAILYFIT</span>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-fire-grad flex items-center justify-center text-white font-bold text-xs shadow-fire">
            {{ auth.user?.name?.[0]?.toUpperCase() }}
          </div>
          <button @click="handleLogout" class="text-stone-500 hover:text-red-400 transition-colors">
            <LogOut :size="16" />
          </button>
        </div>
      </header>

      <main class="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10">
        <slot />
      </main>
    </div>

    <!-- BOTTOM NAV mobile -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <nav class="pointer-events-auto flex items-center bg-stone-950 rounded-[28px] p-1.5 gap-1 border border-stone-800/60 w-full max-w-sm"
           style="box-shadow:0 8px 40px rgba(0,0,0,0.5)">
        <RouterLink
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex-1"
        >
          <div class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-[20px] transition-all duration-200"
               :class="isActive(item.to) ? 'bg-fire-grad shadow-fire' : 'hover:bg-stone-800/60'">
            <component :is="item.icon" :size="19" :class="isActive(item.to) ? 'text-white' : 'text-stone-500'" />
            <span class="text-[9px] font-black tracking-wider uppercase"
                  :class="isActive(item.to) ? 'text-white/90' : 'text-stone-500'">
              {{ item.short }}
            </span>
          </div>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Dumbbell, CalendarCheck, ClipboardList, BarChart3, LogOut, Zap } from 'lucide-vue-next'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',       short: 'Home'  },
  { to: '/exercises', icon: Dumbbell,        label: 'Exercises',        short: 'Exer'  },
  { to: '/plans',     icon: CalendarCheck,   label: 'Workout Plans',    short: 'Plans' },
  { to: '/checklist', icon: ClipboardList,   label: 'Daily Checklist',  short: 'Today' },
  { to: '/stats',     icon: BarChart3,       label: 'Statistics',       short: 'Stats' },
]

function isActive(to) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
