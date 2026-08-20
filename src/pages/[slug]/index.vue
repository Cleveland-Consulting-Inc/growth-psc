<template>
  <!-- Offline -->
  <div v-if="proposal?.status === 'offline'" class="min-h-screen flex items-center justify-center bg-zinc-950">
    <div class="text-center px-6">
      <img v-if="sport" :src="sport.logoPath" :alt="sport.brandName" class="h-12 mx-auto mb-8 object-contain" />
      <p class="text-zinc-400 text-lg">This proposal is not currently available.</p>
    </div>
  </div>

  <!-- PIN gate -->
  <div v-else-if="!unlocked" class="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
    <div class="w-full max-w-sm text-center">
      <img v-if="sport" :src="sport.logoPath" :alt="sport.brandName" class="h-14 mx-auto mb-10 object-contain" />
      <h1 class="text-white text-xl font-semibold mb-2">{{ proposal?.university_name }}</h1>
      <p class="text-zinc-400 text-sm mb-8">Enter your PIN to view this proposal.</p>
      <form class="space-y-4" @submit.prevent="verify">
        <input
          v-model="pin"
          type="text"
          inputmode="numeric"
          maxlength="4"
          pattern="\d{4}"
          placeholder="4-digit PIN"
          class="w-full text-center text-2xl font-mono tracking-[0.4em] px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400"
          autofocus
        />
        <p v-if="pinError" class="text-red-400 text-sm">{{ pinError }}</p>
        <button
          type="submit"
          :disabled="verifying || pin.length < 4"
          class="w-full py-3 rounded-lg font-semibold text-sm transition disabled:opacity-40"
          :style="{ background: sport?.accentColor ?? '#d7192f', color: '#fff' }"
        >
          {{ verifying ? 'Checking…' : 'View Proposal' }}
        </button>
      </form>
    </div>
  </div>

  <!-- Proposal content -->
  <ProposalPage v-else-if="proposal && sport && content" :proposal="{ ...proposal, content }" :sport="sport" />
</template>

<script setup lang="ts">
import { SPORTS } from '~/server/utils/sports'
import type { SportSlug } from '~/server/utils/sports'

const route = useRoute()
const slug = route.params.slug as string

const { data: proposal } = await useFetch(`/api/proposals/${slug}`)

const sport = computed(() => {
  if (!proposal.value?.sport) return null
  return SPORTS[proposal.value.sport as SportSlug] ?? null
})

const cookie = useCookie(`proposal-${slug}`)
const unlocked = ref(cookie.value === 'granted')

// Fetch full content only once the session cookie is present
const content = ref<Record<string, any> | null>(null)
if (unlocked.value) {
  const { data } = await useFetch(`/api/proposals/${slug}/content`)
  content.value = data.value as Record<string, any>
}

const pin = ref('')
const pinError = ref('')
const verifying = ref(false)

useHead(() => ({
  title: proposal.value?.university_name ?? 'Proposal',
}))

async function verify() {
  if (pin.value.length !== 4) return
  verifying.value = true
  pinError.value = ''
  try {
    const res = await $fetch(`/api/proposals/${slug}/verify`, {
      method: 'POST',
      body: { pin: pin.value },
    }) as any
    if (res.ok) {
      cookie.value = 'granted'
      // Fetch content now that the server has set the session cookie
      const { data } = await useFetch(`/api/proposals/${slug}/content`)
      content.value = data.value as Record<string, any>
      unlocked.value = true
    } else {
      pinError.value = 'Incorrect PIN. Please try again.'
      pin.value = ''
    }
  } catch (err: any) {
    if (err?.status === 429) {
      pinError.value = err?.data?.message ?? 'Too many attempts — try again in 15 minutes.'
    } else {
      pinError.value = 'Something went wrong. Please try again.'
    }
  } finally {
    verifying.value = false
  }
}
</script>
