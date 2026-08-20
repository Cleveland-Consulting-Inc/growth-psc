<template>
  <div class="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-semibold text-zinc-900 mb-8 text-center">Growth.PSC Admin</h1>
      <form class="bg-white border border-zinc-200 rounded-lg p-8 space-y-5" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            required
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-zinc-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    navigateTo('/admin')
  } catch {
    error.value = 'Incorrect password.'
  } finally {
    loading.value = false
  }
}
</script>
