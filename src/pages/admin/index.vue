<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-zinc-900">Proposals</h1>
      <NuxtLink
        to="/admin/proposals/new"
        class="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-700 transition"
      >
        New Proposal
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-sm text-zinc-400">Loading…</div>

    <div v-else-if="!proposals?.length" class="text-sm text-zinc-500 py-12 text-center border border-dashed border-zinc-300 rounded-lg">
      No proposals yet. <NuxtLink to="/admin/proposals/new" class="underline">Create the first one.</NuxtLink>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th class="text-left px-5 py-3 font-medium text-zinc-500">University</th>
            <th class="text-left px-5 py-3 font-medium text-zinc-500">URL</th>
            <th class="text-left px-5 py-3 font-medium text-zinc-500">PIN</th>
            <th class="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
            <th class="text-left px-5 py-3 font-medium text-zinc-500">Views</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="p in proposals" :key="p.id">
            <td class="px-5 py-3 font-medium text-zinc-900">{{ p.university_name }}</td>
            <td class="px-5 py-3 text-zinc-500 font-mono text-xs">/{{ p.slug }}/</td>
            <td class="px-5 py-3 font-mono text-zinc-700">{{ p.pin }}</td>
            <td class="px-5 py-3">
              <button
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition"
                :class="p.status === 'live'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'"
                @click="toggleStatus(p)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="p.status === 'live' ? 'bg-emerald-500' : 'bg-zinc-400'"></span>
                {{ p.status === 'live' ? 'Live' : 'Offline' }}
              </button>
            </td>
            <td class="px-5 py-3 text-zinc-500">{{ p.view_count ?? 0 }}</td>
            <td class="px-5 py-3 text-right">
              <NuxtLink :to="`/admin/proposals/${p.id}`" class="text-zinc-500 hover:text-zinc-900 text-xs underline">
                Edit
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const { data: proposals, pending, refresh } = await useFetch('/api/admin/proposals')

async function toggleStatus(p: any) {
  const newStatus = p.status === 'live' ? 'offline' : 'live'
  await $fetch(`/api/admin/proposals/${p.id}`, { method: 'PUT', body: { status: newStatus } })
  p.status = newStatus
}
</script>
