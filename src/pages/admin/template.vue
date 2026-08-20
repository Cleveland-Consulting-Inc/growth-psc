<template>
  <div class="max-w-3xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-zinc-900">Master Template</h1>
      <p class="text-sm text-zinc-500 mt-1">
        These are the default content values for new proposals. Changes here only affect proposals created in the future — existing proposals are unaffected.
        <span v-if="template">Last saved: {{ formatDate(template.updated_at) }} (version {{ template.version }})</span>
      </p>
    </div>

    <Transition name="fade">
      <div v-if="saved" class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg">
        Template saved.
      </div>
    </Transition>
    <p v-if="saveError" class="mb-6 text-sm text-red-600">{{ saveError }}</p>

    <div v-if="content" class="bg-white border border-zinc-200 rounded-lg p-6 space-y-8">

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
        <div class="grid grid-cols-2 gap-4">
          <Field label="Stat 1 Value" v-model="content.about_stat_1_value" />
          <Field label="Stat 1 Label" v-model="content.about_stat_1_label" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Stat 2 Value" v-model="content.about_stat_2_value" />
          <Field label="Stat 2 Label" v-model="content.about_stat_2_label" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Stat 3 Value" v-model="content.about_stat_3_value" />
          <Field label="Stat 3 Label" v-model="content.about_stat_3_label" />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Coach Network</h3>
        <Field label="Section Heading" v-model="content.network_heading" />
        <Field label="Section Body" v-model="content.network_body" textarea />
        <Field label="Coaches (one per line: Name, School)" v-model="content.network_coaches" textarea :rows="8" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">What We Provide</h3>
        <Field label="Services (one per line: ##|Heading|Description)" v-model="content.services" textarea :rows="8" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Package 1</h3>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Name" v-model="content.package_1_name" />
          <Field label="Subtitle" v-model="content.package_1_subtitle" />
        </div>
        <Field label="Percentage" v-model="content.package_1_percent" />
        <Field label="Tagline" v-model="content.package_1_tagline" textarea />
        <Field label="Features (one per line)" v-model="content.package_1_features" textarea :rows="6" />
      </section>

      <section class="space-y-4">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Package 2</h3>
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

      <div class="pt-4 border-t border-zinc-100 flex items-center gap-4">
        <button
          :disabled="saving"
          class="bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition"
          @click="confirmSave"
        >
          {{ saving ? 'Saving…' : 'Save Template' }}
        </button>
        <p class="text-xs text-zinc-400">This will not affect existing proposals.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const { data: template } = await useFetch('/api/admin/template')
const content = reactive<Record<string, string>>({ ...(template.value?.content ?? {}) })
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

async function confirmSave() {
  if (!confirm('Save template? This will not change any existing proposals.')) return
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    const updated = await $fetch('/api/admin/template', { method: 'PUT', body: { content } })
    template.value = updated as any
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    saveError.value = 'Save failed. Please try again.'
  } finally {
    saving.value = false
  }
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
