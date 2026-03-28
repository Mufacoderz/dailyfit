<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="font-display text-5xl tracking-wider text-fire-grad leading-none">STATISTICS</h1>
        <p class="text-stone-500 text-sm mt-1">Your progress at a glance</p>
      </div>

      <div v-if="loading" class="space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="i in 4" :key="i" class="bg-stone-900 rounded-2xl h-28 animate-pulse"></div>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-stone-900 rounded-2xl h-64 animate-pulse"></div>
          <div class="bg-stone-900 rounded-2xl h-64 animate-pulse"></div>
        </div>
      </div>

      <template v-else>
        <!-- Overview cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div v-for="(card, i) in statCards" :key="i"
            class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 flex flex-col gap-2">
            <component :is="card.icon" :size="22" class="text-ember-500 opacity-80" />
            <div class="font-display text-4xl tracking-wider text-white leading-none">{{ card.value }}</div>
            <div class="text-xs font-bold text-stone-500 uppercase tracking-wider">{{ card.label }}</div>
          </div>
        </div>

        <!-- Charts row -->
        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <!-- Weekly bar chart (manual SVG) -->
          <div class="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
            <h2 class="font-display text-xl tracking-wider text-white mb-5">WEEKLY ACTIVITY</h2>
            <div class="flex items-end gap-2 h-40">
              <div v-for="day in weekly" :key="day.day" class="flex-1 flex flex-col items-center justify-end gap-1">
                <span class="text-[10px] font-bold text-ember-400" v-if="day.completed > 0">{{ day.completed }}</span>
                <div class="w-full flex flex-col-reverse gap-0.5">
                  <!-- completed bar -->
                  <div class="w-full rounded-t transition-all duration-700"
                    :style="`height:${barH(day.completed)}px; background:linear-gradient(to top,#dc2626,#ea580c)`"></div>
                  <!-- remaining bar -->
                  <div class="w-full"
                    :style="`height:${barH(day.total - day.completed)}px; background:#292524; border-radius:4px 4px 0 0`"></div>
                </div>
                <span class="text-[10px] font-bold text-stone-600">{{ day.day }}</span>
              </div>
            </div>
            <div class="flex gap-4 mt-3">
              <div class="flex items-center gap-1.5">
                <div class="w-2.5 h-2.5 rounded-sm bg-fire-grad"></div>
                <span class="text-xs text-stone-500">Completed</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-2.5 h-2.5 rounded-sm bg-stone-700"></div>
                <span class="text-xs text-stone-500">Remaining</span>
              </div>
            </div>
          </div>

          <!-- Category breakdown -->
          <div class="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
            <h2 class="font-display text-xl tracking-wider text-white mb-5">BY CATEGORY</h2>
            <div v-if="!categories.length" class="flex items-center justify-center h-40 text-stone-600 text-sm">No data yet</div>
            <div v-else class="space-y-3">
              <div v-for="(cat, i) in categories" :key="cat.category" class="flex items-center gap-3">
                <div class="text-xs font-bold text-stone-500 w-4 text-right">{{ i+1 }}</div>
                <div class="text-sm font-semibold text-white w-24 truncate capitalize">{{ cat.category }}</div>
                <div class="flex-1 h-4 bg-stone-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="`width:${Math.round((cat.total/maxCat)*100)}%; background:${PIE_COLORS[i % PIE_COLORS.length]}`"></div>
                </div>
                <div class="text-xs font-bold text-stone-400 w-6 text-right">{{ cat.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion trend line (manual SVG) -->
        <div class="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
          <h2 class="font-display text-xl tracking-wider text-white mb-5">COMPLETION TREND (7 DAYS)</h2>
          <div class="relative h-36 w-full">
            <svg class="w-full h-full" :viewBox="`0 0 ${svgW} ${svgH}`" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#dc2626"/>
                  <stop offset="100%" stop-color="#ea580c"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line v-for="n in 4" :key="n"
                :x1="0" :y1="(svgH/4)*n" :x2="svgW" :y2="(svgH/4)*n"
                stroke="#292524" stroke-width="1"/>
              <!-- Total dashed line -->
              <polyline v-if="weekly.length"
                :points="linePoints('total')" fill="none" stroke="#44403c" stroke-width="2" stroke-dasharray="5,4"/>
              <!-- Completed solid line -->
              <polyline v-if="weekly.length"
                :points="linePoints('completed')" fill="none" stroke="url(#lineGrad)" stroke-width="2.5"/>
              <!-- Dots -->
              <circle v-for="(d,i) in weekly" :key="i+'c'"
                :cx="ptX(i)" :cy="ptY(d.completed)" r="4" fill="#ea580c"/>
            </svg>
            <!-- X labels -->
            <div class="flex justify-between mt-1">
              <span v-for="d in weekly" :key="d.day" class="text-[10px] font-bold text-stone-600 flex-1 text-center">{{ d.day }}</span>
            </div>
          </div>
        </div>

        <!-- Detail table -->
        <div class="bg-stone-900 border border-stone-700/50 rounded-2xl p-5 mt-4">
          <h2 class="font-display text-xl tracking-wider text-white mb-4">7-DAY DETAIL</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-stone-800">
                  <th class="text-left py-2 text-xs font-black text-stone-500 uppercase tracking-wider">Day</th>
                  <th class="text-center py-2 text-xs font-black text-stone-500 uppercase tracking-wider">Total</th>
                  <th class="text-center py-2 text-xs font-black text-stone-500 uppercase tracking-wider">Done</th>
                  <th class="text-center py-2 text-xs font-black text-stone-500 uppercase tracking-wider">Rate</th>
                  <th class="text-center py-2 text-xs font-black text-stone-500 uppercase tracking-wider">XP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in [...weekly].reverse()" :key="d.day+'-t'" class="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                  <td class="py-2.5 font-semibold text-stone-300">{{ d.fullDate }}</td>
                  <td class="py-2.5 text-center text-stone-400">{{ d.total }}</td>
                  <td class="py-2.5 text-center font-bold text-ember-400">{{ d.completed }}</td>
                  <td class="py-2.5 text-center">
                    <span class="font-bold" :class="rateColor(d.completed, d.total)">
                      {{ d.total === 0 ? '—' : Math.round((d.completed/d.total)*100)+'%' }}
                    </span>
                  </td>
                  <td class="py-2.5 text-center font-bold text-stone-400">{{ d.completed * 10 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { api } from '@/services/api'
import { Flame, Dumbbell, Calendar, TrendingUp } from 'lucide-vue-next'

const PIE_COLORS = ['#DC2626','#EA580C','#10B981','#3B82F6','#9333EA','#F59E0B']

const loading    = ref(true)
const overview   = ref(null)
const weekly     = ref([])
const categories = ref([])

const svgW = 600
const svgH = 120

const statCards = computed(() => [
  { icon: Flame,      value: overview.value?.streak ?? 0,             label: 'Day Streak 🔥' },
  { icon: Dumbbell,   value: overview.value?.totalExercises ?? 0,      label: 'Total Exercises' },
  { icon: Calendar,   value: overview.value?.totalWorkoutDays ?? 0,    label: 'Workout Days' },
  { icon: TrendingUp, value: (overview.value?.completionRate ?? 0)+'%', label: 'Completion Rate' },
])

const maxDay = computed(() => Math.max(...weekly.value.map(d => d.total), 1))
const maxCat = computed(() => Math.max(...categories.value.map(c => c.total), 1))

function barH(val) { return Math.max(Math.round((val / maxDay.value) * 120), val > 0 ? 4 : 0) }

function ptX(i) { return weekly.value.length < 2 ? svgW/2 : (i / (weekly.value.length - 1)) * svgW }
function ptY(val) {
  const max = maxDay.value
  return max === 0 ? svgH : svgH - Math.round((val / max) * (svgH - 12)) - 6
}
function linePoints(key) {
  return weekly.value.map((d, i) => `${ptX(i)},${ptY(d[key])}`).join(' ')
}
function rateColor(done, total) {
  if (!total) return 'text-stone-600'
  const r = done / total
  if (r >= 0.8) return 'text-emerald-400'
  if (r >= 0.5) return 'text-amber-400'
  return 'text-red-400'
}

onMounted(async () => {
  const [o, w, c] = await Promise.all([
    api.get('/stats?type=overview').catch(() => null),
    api.get('/stats?type=weekly').catch(() => []),
    api.get('/stats?type=categories').catch(() => []),
  ])
  overview.value   = o
  weekly.value     = Array.isArray(w) ? w : []
  categories.value = Array.isArray(c) ? c : []
  loading.value    = false
})
</script>
