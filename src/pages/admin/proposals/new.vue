<template>
  <div class="max-w-lg">
    <h1 class="text-2xl font-semibold text-zinc-900 mb-8">New Proposal</h1>

    <form class="bg-white border border-zinc-200 rounded-lg p-8 space-y-6" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-zinc-700 mb-1.5">Sport</label>
        <select
          v-model="form.sport"
          class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          required
        >
          <option value="">Select a sport…</option>
          <option value="tennis">Tennis — Wilson Tennis Camps</option>
          <option value="lacrosse">Lacrosse — US Lacrosse Camps</option>
          <option value="volleyball">Volleyball — US Volleyball Camps</option>
          <option value="soccer">Soccer — Elite 11 Soccer Camps</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700 mb-1.5">University Name</label>
        <input
          v-model="form.university_name"
          type="text"
          placeholder="Yale University"
          class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          required
          @input="suggestSlug"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700 mb-1.5">URL Slug</label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-zinc-400">/</span>
          <input
            v-model="form.slug"
            type="text"
            placeholder="yale"
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            class="flex-1 px-3 py-2 border border-zinc-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
            required
          />
          <span class="text-sm text-zinc-400">/</span>
        </div>
        <p class="mt-1.5 text-xs text-zinc-400">Lowercase letters, numbers, and hyphens only</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700 mb-1.5">4-Digit PIN</label>
        <input
          v-model="form.pin"
          type="text"
          inputmode="numeric"
          maxlength="4"
          pattern="\d{4}"
          placeholder="e.g. 4827"
          class="w-32 px-3 py-2 border border-zinc-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
          required
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition"
        >
          {{ loading ? 'Creating…' : 'Create Proposal' }}
        </button>
        <NuxtLink to="/admin" class="text-sm text-zinc-500 hover:text-zinc-800 px-3 py-2.5">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const form = reactive({ sport: '', university_name: '', slug: '', pin: '' })
const error = ref('')
const loading = ref(false)

function suggestSlug() {
  form.slug = form.university_name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const proposal = await $fetch('/api/admin/proposals', { method: 'POST', body: form })
    navigateTo(`/admin/proposals/${(proposal as any).id}`)
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>
