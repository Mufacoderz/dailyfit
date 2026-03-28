<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="bg-stone-900 border border-stone-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-stone-800/50">
            <h2 class="font-display text-xl tracking-widest text-white">{{ title }}</h2>
            <button @click="$emit('close')" class="text-stone-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-800">✕</button>
          </div>
          <div class="px-6 py-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ open: Boolean, title: String })
defineEmits(['close'])
</script>

<style scoped>
.modal-enter-active,.modal-leave-active{transition:opacity .2s,transform .2s}
.modal-enter-from,.modal-leave-to{opacity:0;transform:scale(.95)}
</style>
