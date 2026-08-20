<template>
  <div class="min-h-screen bg-zinc-50">
    <nav class="bg-white border-b border-zinc-200 px-6 py-3 flex items-center gap-6">
      <NuxtLink to="/admin" class="font-semibold text-zinc-900 text-sm">Growth.PSC</NuxtLink>
      <NuxtLink to="/admin" class="text-sm text-zinc-500 hover:text-zinc-900">Dashboard</NuxtLink>
      <NuxtLink to="/admin/template" class="text-sm text-zinc-500 hover:text-zinc-900">Template</NuxtLink>
      <NuxtLink to="/admin/proposals/new" class="text-sm text-zinc-500 hover:text-zinc-900">New Proposal</NuxtLink>
      <button class="ml-auto text-sm text-zinc-400 hover:text-zinc-700" @click="logout">Log out</button>
    </nav>
    <main class="max-w-5xl mx-auto px-6 py-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}
</script>
