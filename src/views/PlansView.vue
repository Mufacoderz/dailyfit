<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="font-display text-5xl tracking-wider text-fire-grad leading-none">WORKOUT PLANS</h1>
          <p class="text-stone-500 text-sm mt-1">{{ plans.length }} custom plans</p>
        </div>
        <button @click="openModal()" class="bg-fire-grad text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-fire hover:shadow-fire-lg transition-all flex items-center gap-1.5">
          <Plus :size="15" /> New Plan
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-stone-900 rounded-2xl h-52 animate-pulse"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="plans.length === 0" class="flex flex-col items-center py-20 text-center">
        <div class="text-5xl mb-4 opacity-30">📋</div>
        <p class="font-display text-2xl tracking-wider text-stone-500 mb-2">NO PLANS YET</p>
        <p class="text-stone-600 text-sm mb-5">Create your first workout plan</p>
        <button @click="openModal()" class="bg-fire-grad text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-fire flex items-center gap-1.5">
          <Plus :size="15" /> Create First Plan
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="plan in plans" :key="plan.id"
          class="bg-stone-900 border border-stone-700/50 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200">
          <!-- Header gradient -->
          <div class="bg-fire-grad p-4">
            <div class="font-display text-xl tracking-wider text-white">{{ plan.name }}</div>
            <div v-if="plan.description" class="text-xs text-white/70 mt-1">{{ plan.description }}</div>
          </div>
          <!-- Body -->
          <div class="p-4 flex flex-col flex-1">
            <div class="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-3">
              <Dumbbell :size="12" /> {{ plan.exercises?.length || 0 }} exercises
            </div>
            <div class="flex flex-wrap gap-1 mb-4">
              <span v-for="pe in (plan.exercises || []).slice(0,4)" :key="pe.id || pe.exercise_id"
                class="text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700/50 px-2 py-0.5 rounded-full">
                {{ pe.exercise?.name || pe.name }}
              </span>
              <span v-if="(plan.exercises?.length||0) > 4" class="text-[10px] font-bold text-stone-600 px-1">
                +{{ plan.exercises.length - 4 }}
              </span>
            </div>
            <div class="flex gap-2 border-t border-stone-700/40 pt-3 mt-auto">
              <button @click="startWorkout(plan)"
                class="flex-1 flex items-center justify-center gap-1.5 bg-fire-grad text-white text-xs font-black py-2 rounded-xl shadow-fire hover:shadow-fire-lg transition-all">
                <PlayCircle :size="13" /> Start Today
              </button>
              <button @click="openModal(plan)" class="w-8 flex items-center justify-center bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors">
                <Pencil :size="13" />
              </button>
              <button @click="deletePlan(plan.id)" class="w-8 flex items-center justify-center bg-stone-800 text-stone-500 hover:text-red-400 rounded-xl transition-colors">
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :open="showModal" :title="editingPlan?.id ? 'EDIT PLAN' : 'NEW PLAN'" @close="closeModal">
      <form @submit.prevent="savePlan" class="space-y-4">
        <div v-if="formError" class="bg-red-950/50 border border-red-800/40 text-red-400 text-sm px-3 py-2 rounded-xl">{{ formError }}</div>
        <div>
          <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Plan Name *</label>
          <input v-model="form.name" required placeholder="e.g. Push Day, Leg Day..."
            class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Description</label>
          <textarea v-model="form.description" rows="2"
            class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">
            Exercises ({{ form.exerciseIds.length }} selected)
          </label>
          <div class="max-h-48 overflow-y-auto space-y-1 border border-stone-700/50 rounded-xl p-2 bg-stone-800/30">
            <label v-for="ex in allExercises" :key="ex.id"
              class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all"
              :class="form.exerciseIds.includes(ex.id) ? 'bg-ember-600/15 border border-ember-600/20' : 'hover:bg-stone-700/30 border border-transparent'">
              <input type="checkbox" :value="ex.id" v-model="form.exerciseIds" class="accent-orange-500 w-4 h-4" />
              <span class="text-sm font-semibold text-white flex-1">{{ ex.name }}</span>
              <span class="text-xs text-stone-500">{{ ex.category }}</span>
            </label>
            <p v-if="!allExercises.length" class="text-center text-sm text-stone-600 py-3">No exercises yet</p>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="closeModal" class="px-4 py-2 rounded-xl text-sm font-bold text-stone-400 hover:text-white hover:bg-stone-800 transition-all">Cancel</button>
          <button type="submit" :disabled="saving" class="bg-fire-grad text-white text-sm font-black px-5 py-2 rounded-xl shadow-fire disabled:opacity-60 flex items-center gap-2">
            <span v-if="saving" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ editingPlan?.id ? 'Save Changes' : 'Create Plan' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700/50 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl z-50 whitespace-nowrap">
        {{ toast }}
      </div>
    </Transition>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppModal  from '@/components/AppModal.vue'
import { api } from '@/services/api'
import { useRouter } from 'vue-router'
import { Plus, Dumbbell, Pencil, Trash2, PlayCircle } from 'lucide-vue-next'

const router      = useRouter()
const plans       = ref([])
const allExercises= ref([])
const loading     = ref(true)
const showModal   = ref(false)
const saving      = ref(false)
const formError   = ref('')
const editingPlan = ref(null)
const toast       = ref('')

const defaultForm = () => ({ name: '', description: '', exerciseIds: [] })
const form = ref(defaultForm())

async function load() {
  loading.value = true
  const [p, e] = await Promise.all([api.get('/plans').catch(()=>[]), api.get('/exercises').catch(()=>[])])
  plans.value        = Array.isArray(p) ? p : []
  allExercises.value = Array.isArray(e) ? e : []
  loading.value = false
}

function openModal(plan = null) {
  editingPlan.value = plan
  form.value = plan
    ? { name: plan.name, description: plan.description||'', exerciseIds: (plan.exercises||[]).map(e => e.exercise_id || e.id) }
    : defaultForm()
  formError.value = ''
  showModal.value = true
}
function closeModal() { showModal.value = false }

async function savePlan() {
  if (!form.value.name.trim()) { formError.value = 'Nama plan wajib!'; return }
  saving.value = true
  try {
    if (editingPlan.value?.id) await api.put(`/plans/${editingPlan.value.id}`, form.value)
    else await api.post('/plans', form.value)
    closeModal(); load()
  } catch (e) { formError.value = e?.message || 'Gagal menyimpan.' }
  finally { saving.value = false }
}

async function deletePlan(id) {
  if (!confirm('Hapus plan ini?')) return
  await api.delete(`/plans/${id}`); load()
}

async function startWorkout(plan) {
  const today = new Date().toISOString().split('T')[0]
  await api.post('/checklist/from-plan', { planId: plan.id, date: today })
  showToast(`▶ "${plan.name}" dimuat ke hari ini!`)
  setTimeout(() => router.push('/checklist'), 1000)
}

function showToast(msg) { toast.value = msg; setTimeout(() => toast.value = '', 3000) }

onMounted(load)
</script>

<style scoped>
.toast-enter-active,.toast-leave-active{transition:opacity .25s,transform .25s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translate(-50%,12px)}
</style>
