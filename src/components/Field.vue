<template>
  <div>
    <label class="block text-xs font-medium text-zinc-600 mb-1">{{ label }}</label>
    <textarea
      v-if="textarea"
      :value="modelValue"
      :rows="rows"
      class="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-y font-mono"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <input
      v-else
      :value="modelValue"
      type="text"
      class="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  textarea?: boolean
  rows?: number
}>()
defineEmits(['update:modelValue'])
</script>
