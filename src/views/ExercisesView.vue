<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="font-display text-5xl tracking-wider text-fire-grad leading-none">EXERCISES</h1>
          <p class="text-stone-500 text-sm mt-1">{{ exercises.length }} exercises in your library</p>
        </div>
        <button @click="openModal()" class="bg-fire-grad text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-fire hover:shadow-fire-lg transition-all flex items-center gap-1.5">
          <Plus :size="15" /> Add Exercise
        </button>
      </div>

      <!-- Filters -->
      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="relative">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input v-model="search" placeholder="Search exercises..."
            class="bg-stone-800/60 border border-stone-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all w-52" />
        </div>
        <div class="flex gap-1.5 bg-stone-900 border border-stone-700/50 rounded-xl p-1">
          <button v-for="cat in ['all', ...CATEGORIES]" :key="cat" @click="filterCat = cat"
            class="relative px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
            :class="filterCat === cat ? 'bg-fire-grad text-white shadow-fire' : 'text-stone-500 hover:text-stone-300'">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="i in 6" :key="i" class="bg-stone-900 rounded-2xl h-36 animate-pulse"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center py-20 text-center">
        <div class="text-5xl mb-4 opacity-30">💪</div>
        <p class="font-display text-2xl tracking-wider text-stone-500 mb-2">NO EXERCISES YET</p>
        <p class="text-stone-600 text-sm mb-5">Start by adding your first exercise</p>
        <button @click="openModal()" class="bg-fire-grad text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-fire flex items-center gap-1.5">
          <Plus :size="15" /> Add First Exercise
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="ex in filtered" :key="ex.id"
          class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-200">
          <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-fire-grad"></div>
          <div class="pl-2">
            <div class="font-bold text-white text-sm mb-2">{{ ex.name }}</div>
            <div class="flex gap-1.5 flex-wrap mb-3">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="tagColor(ex.category)">{{ ex.category }}</span>
              <span v-if="ex.muscle_group || ex.muscleGroup" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/50">
                {{ ex.muscle_group || ex.muscleGroup }}
              </span>
            </div>
            <div class="flex gap-3 text-xs text-stone-500">
              <span class="flex items-center gap-1"><Layers :size="11" /> {{ ex.sets }} sets</span>
              <span>× {{ ex.reps }} reps</span>
            </div>
            <p v-if="ex.notes" class="text-xs text-stone-600 mt-2 line-clamp-2">{{ ex.notes }}</p>
            <div class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openModal(ex)" class="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-ember-400 transition-colors">
                <Pencil :size="11" /> Edit
              </button>
              <button @click="deleteEx(ex.id)" class="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-red-400 transition-colors">
                <Trash2 :size="11" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :open="showModal" :title="editingEx?.id ? 'EDIT EXERCISE' : 'NEW EXERCISE'" @close="closeModal">
      <form @submit.prevent="saveEx" class="space-y-4">
        <div v-if="formError" class="bg-red-950/50 border border-red-800/40 text-red-400 text-sm px-3 py-2 rounded-xl">{{ formError }}</div>
        <div>
          <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Exercise Name *</label>
          <input v-model="form.name" required placeholder="e.g. Bench Press"
            class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Category</label>
            <select v-model="form.category" class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-500 transition-all">
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c.charAt(0).toUpperCase() + c.slice(1) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Muscle Group</label>
            <select v-model="form.muscle_group" class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-500 transition-all">
              <option value="">Select...</option>
              <option v-for="m in MUSCLES" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Sets</label>
            <input v-model.number="form.sets" type="number" min="1" class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ember-500 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Reps</label>
            <input v-model.number="form.reps" type="number" min="1" class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ember-500 transition-all" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Notes</label>
          <textarea v-model="form.notes" rows="3" placeholder="Tips, variations..."
            class="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-500 transition-all resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" @click="closeModal" class="px-4 py-2 rounded-xl text-sm font-bold text-stone-400 hover:text-white hover:bg-stone-800 transition-all">Cancel</button>
          <button type="submit" :disabled="saving" class="bg-fire-grad text-white text-sm font-black px-5 py-2 rounded-xl shadow-fire disabled:opacity-60 flex items-center gap-2">
            <span v-if="saving" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ editingEx?.id ? 'Save Changes' : 'Add Exercise' }}
          </button>
        </div>
      </form>
    </AppModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppModal  from '@/components/AppModal.vue'
import { api } from '@/services/api'
import { Plus, Search, Layers, Pencil, Trash2 } from 'lucide-vue-next'

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance']
const MUSCLES    = ['Chest','Back','Shoulders','Biceps','Triceps','Core','Legs','Glutes','Full Body']
const TAG_COLORS = {
  strength:    'bg-red-950/60 text-red-400 border-red-900/40',
  cardio:      'bg-orange-950/60 text-orange-400 border-orange-900/40',
  flexibility: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
  balance:     'bg-blue-950/60 text-blue-400 border-blue-900/40',
}
function tagColor(c) { return TAG_COLORS[c?.toLowerCase()] || 'bg-stone-800 text-stone-400 border-stone-700/50' }

const exercises  = ref([])
const loading    = ref(true)
const showModal  = ref(false)
const saving     = ref(false)
const formError  = ref('')
const editingEx  = ref(null)
const search     = ref('')
const filterCat  = ref('all')

const defaultForm = () => ({ name: '', category: 'strength', muscle_group: '', sets: 3, reps: 10, notes: '' })
const form = ref(defaultForm())

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return exercises.value.filter(ex =>
    (ex.name.toLowerCase().includes(s) || (ex.muscle_group||'').toLowerCase().includes(s)) &&
    (filterCat.value === 'all' || ex.category === filterCat.value)
  )
})

async function load() {
  loading.value = true
  exercises.value = await api.get('/exercises').catch(() => [])
  loading.value = false
}

function openModal(ex = null) {
  editingEx.value = ex
  form.value = ex ? { name: ex.name, category: ex.category, muscle_group: ex.muscle_group||'', sets: ex.sets, reps: ex.reps, notes: ex.notes||'' } : defaultForm()
  formError.value = ''
  showModal.value = true
}
function closeModal() { showModal.value = false }

async function saveEx() {
  if (!form.value.name.trim()) { formError.value = 'Nama wajib diisi!'; return }
  saving.value = true
  try {
    if (editingEx.value?.id) await api.put(`/exercises/${editingEx.value.id}`, form.value)
    else await api.post('/exercises', form.value)
    closeModal(); load()
  } catch (e) { formError.value = e?.message || 'Gagal menyimpan.' }
  finally { saving.value = false }
}

async function deleteEx(id) {
  if (!confirm('Hapus exercise ini?')) return
  await api.delete(`/exercises/${id}`); load()
}

onMounted(load)
</script>
