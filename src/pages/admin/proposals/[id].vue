<template>
  <div v-if="proposal">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 gap-4">
      <div>
        <NuxtLink to="/admin" class="text-xs text-zinc-400 hover:text-zinc-700 mb-2 inline-block">← All Proposals</NuxtLink>
        <h1 class="text-2xl font-semibold text-zinc-900">{{ proposal.university_name }}</h1>
        <p class="text-sm text-zinc-400 font-mono mt-1">/{{ proposal.slug }}/</p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-sm text-zinc-500">PIN: <span class="font-mono font-medium text-zinc-900">{{ proposal.pin }}</span></span>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border"
          :class="proposal.status === 'live'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'"
          @click="toggleStatus"
        >
          <span class="w-2 h-2 rounded-full" :class="proposal.status === 'live' ? 'bg-emerald-500' : 'bg-zinc-400'"></span>
          {{ proposal.status === 'live' ? 'Live — click to take offline' : 'Offline — click to go live' }}
        </button>
      </div>
    </div>

    <!-- Save banner -->
    <Transition name="fade">
      <div v-if="saved" class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg">
        Changes saved.
      </div>
    </Transition>
    <p v-if="saveError" class="mb-6 text-sm text-red-600">{{ saveError }}</p>

    <!-- Content Editor -->
    <div class="bg-white border border-zinc-200 rounded-lg p-6 space-y-8 mb-10">
      <h2 class="text-base font-semibold text-zinc-900">Content</h2>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">General</h3>
        <Field label="Partner Name" v-model="content.partner_name" />
        <Field label="Page Title" v-model="content.page_title" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Hero</h3>
        <Field label="Eyebrow" v-model="content.hero_eyebrow" />
        <Field label="Headline" v-model="content.hero_headline" />
        <Field label="Subheadline" v-model="content.hero_subheadline" textarea />
        <div class="grid grid-cols-2 gap-4">
          <Field label="Stat Number" v-model="content.hero_stat_number" />
          <Field label="Stat Label" v-model="content.hero_stat_label" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">About / Partnership</h3>
        <Field label="Section Heading" v-model="content.about_heading" />
        <Field label="PSC Description" v-model="content.about_psc_body" textarea />
        <Field label="Partner Description" v-model="content.about_partner_body" textarea />
        <div class="grid grid-cols-3 gap-4">
          <Field label="Stat 1 Value" v-model="content.about_stat_1_value" />
          <Field label="Stat 1 Label" v-model="content.about_stat_1_label" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <Field label="Stat 2 Value" v-model="content.about_stat_2_value" />
          <Field label="Stat 2 Label" v-model="content.about_stat_2_label" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <Field label="Stat 3 Value" v-model="content.about_stat_3_value" />
          <Field label="Stat 3 Label" v-model="content.about_stat_3_label" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Coach Network</h3>
        <Field label="Section Heading" v-model="content.network_heading" />
        <Field label="Section Body" v-model="content.network_body" textarea />
        <CoachRoster v-model="content.network_coaches" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">What We Provide</h3>
        <Field
          label="Services (one per line: ##|Heading|Description)"
          v-model="content.services"
          textarea
          :rows="8"
        />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Package 1 (Collegiate)</h3>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Name" v-model="content.package_1_name" />
          <Field label="Subtitle" v-model="content.package_1_subtitle" />
        </div>
        <Field label="Percentage" v-model="content.package_1_percent" />
        <Field label="Tagline" v-model="content.package_1_tagline" textarea />
        <Field label="Features (one per line)" v-model="content.package_1_features" textarea :rows="6" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Package 2 (Classic)</h3>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Name" v-model="content.package_2_name" />
          <Field label="Subtitle" v-model="content.package_2_subtitle" />
        </div>
        <Field label="Percentage" v-model="content.package_2_percent" />
        <Field label="Tagline" v-model="content.package_2_tagline" textarea />
        <Field label="Features (one per line)" v-model="content.package_2_features" textarea :rows="6" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Call to Action</h3>
        <Field label="Heading" v-model="content.cta_heading" />
        <Field label="Subheading" v-model="content.cta_subheading" />
        <Field label="Body" v-model="content.cta_body" textarea />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Contact</h3>
        <div class="grid grid-cols-3 gap-4">
          <Field label="Contact 1 Name" v-model="content.contact_1_name" />
          <Field label="Contact 1 Email" v-model="content.contact_1_email" />
          <Field label="Contact 1 Phone" v-model="content.contact_1_phone" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <Field label="Contact 2 Name" v-model="content.contact_2_name" />
          <Field label="Contact 2 Email" v-model="content.contact_2_email" />
          <Field label="Contact 2 Phone" v-model="content.contact_2_phone" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Footer</h3>
        <Field label="Year" v-model="content.footer_year" />
      </section>

      <div class="pt-2 border-t border-zinc-100 flex gap-3">
        <button
          :disabled="saving"
          class="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition"
          @click="saveContent"
        >
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Access Log -->
    <div class="bg-white border border-zinc-200 rounded-lg p-6">
      <h2 class="text-base font-semibold text-zinc-900 mb-5">Access Log</h2>
      <div v-if="!logs?.length" class="text-sm text-zinc-400">No access attempts yet.</div>
      <table v-else class="w-full text-sm">
        <thead class="border-b border-zinc-100">
          <tr>
            <th class="text-left pb-3 font-medium text-zinc-500">Time</th>
            <th class="text-left pb-3 font-medium text-zinc-500">IP</th>
            <th class="text-left pb-3 font-medium text-zinc-500">Browser</th>
            <th class="text-left pb-3 font-medium text-zinc-500">PIN</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-50">
          <tr v-for="log in logs" :key="log.id">
            <td class="py-2.5 pr-4 text-zinc-500 whitespace-nowrap text-xs">{{ formatDate(log.timestamp) }}</td>
            <td class="py-2.5 pr-4 font-mono text-xs text-zinc-600">{{ log.ip_address ?? '—' }}</td>
            <td class="py-2.5 pr-4 text-zinc-500 text-xs max-w-xs truncate">{{ log.user_agent ?? '—' }}</td>
            <td class="py-2.5">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="log.pin_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
              >
                {{ log.pin_correct ? '✓ Correct' : '✗ Wrong' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const { data: proposal } = await useFetch(`/api/admin/proposals/${id}`)
const { data: logs } = await useFetch(`/api/admin/proposals/${id}/logs`)

const content = reactive<Record<string, string>>({ ...(proposal.value?.content ?? {}) })
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

async function saveContent() {
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    await $fetch(`/api/admin/proposals/${id}`, { method: 'PUT', body: { content } })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    saveError.value = 'Save failed. Please try again.'
  } finally {
    saving.value = false
  }
}

async function toggleStatus() {
  const newStatus = proposal.value!.status === 'live' ? 'offline' : 'live'
  await $fetch(`/api/admin/proposals/${id}`, { method: 'PUT', body: { status: newStatus } })
  proposal.value!.status = newStatus
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
