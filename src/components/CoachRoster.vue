<template>
  <div class="space-y-3">
    <div
      v-for="(coach, i) in coaches"
      :key="i"
      class="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50"
    >
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium text-zinc-500">Coach {{ i + 1 }}</span>
        <button
          type="button"
          class="text-xs text-red-500 hover:text-red-700"
          @click="remove(i)"
        >
          Remove
        </button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-zinc-600 mb-1">Name</label>
          <input
            v-model="coach.name"
            type="text"
            placeholder="John Smith"
            class="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            @input="emit"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-zinc-600 mb-1">Position</label>
          <input
            v-model="coach.position"
            type="text"
            placeholder="Head Coach, Men's Tennis"
            class="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            @input="emit"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-zinc-600 mb-1">University</label>
          <input
            v-model="coach.university"
            type="text"
            placeholder="Yale University"
            class="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            @input="emit"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-zinc-600 mb-1">Photo</label>
          <div class="flex gap-2">
            <input
              v-model="coach.photo_url"
              type="url"
              placeholder="Paste image or URL…"
              class="flex-1 px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              :class="{ 'border-blue-400 bg-blue-50': uploadingIndex === i }"
              @input="emit"
              @paste="pastePhoto(i, $event)"
            />
            <label
              class="cursor-pointer px-3 py-2 border border-zinc-200 rounded-md text-sm text-zinc-600 hover:bg-zinc-50 transition whitespace-nowrap flex items-center"
              :class="{ 'opacity-50 pointer-events-none': uploadingIndex === i }"
              title="Upload from file"
            >
              <span v-if="uploadingIndex === i">Uploading…</span>
              <span v-else>📁</span>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploadingIndex === i"
                @change="uploadPhoto(i, $event)"
              />
            </label>
          </div>
          <p v-if="uploadError === i" class="text-xs text-red-500 mt-1">Upload failed: {{ uploadErrorMsg || 'check connection and try again.' }}</p>
          <p class="text-xs text-zinc-400 mt-1">Paste an image or URL, or click 📁 to browse files.</p>
        </div>
      </div>
      <div v-if="coach.photo_url" class="flex items-center gap-3 pt-1">
        <img
          :src="coach.photo_url"
          :alt="coach.name"
          class="w-12 h-12 rounded-full object-cover border border-zinc-200"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <span class="text-xs text-zinc-400">Photo preview</span>
      </div>
    </div>

    <button
      type="button"
      class="w-full py-2.5 border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition"
      @click="add"
    >
      + Add Coach
    </button>
  </div>
</template>

<script setup lang="ts">
export interface Coach {
  name: string
  position: string
  university: string
  photo_url: string
}

const props = defineProps<{
  modelValue: Coach[] | string
}>()

const emits = defineEmits(['update:modelValue'])

const coaches = ref<Coach[]>(parseValue(props.modelValue))
const uploadingIndex = ref<number | null>(null)
const uploadError = ref<number | null>(null)
const uploadErrorMsg = ref<string>('')

function parseValue(val: Coach[] | string): Coach[] {
  if (Array.isArray(val)) return val.map(c => ({ name: '', position: '', university: '', photo_url: '', ...c }))
  if (typeof val === 'string' && val.trim()) {
    // Migrate old "Name, School" per-line format
    return val.split('\n').filter(Boolean).map(line => {
      const [name, university] = line.split(',').map(s => s.trim())
      return { name: name ?? '', position: '', university: university ?? '', photo_url: '' }
    })
  }
  return []
}

function emit() {
  emits('update:modelValue', [...coaches.value])
}

function add() {
  coaches.value.push({ name: '', position: '', university: '', photo_url: '' })
  emit()
}

function remove(i: number) {
  coaches.value.splice(i, 1)
  emit()
}

async function pastePhoto(i: number, event: ClipboardEvent) {
  const imageItem = Array.from(event.clipboardData?.items ?? []).find(
    item => item.kind === 'file' && item.type.startsWith('image/')
  )
  if (!imageItem) return // plain text URL paste — let it fall through normally
  event.preventDefault()
  const file = imageItem.getAsFile()
  if (!file) return
  await uploadFile(i, file)
}

async function uploadPhoto(i: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  await uploadFile(i, file)
  ;(event.target as HTMLInputElement).value = ''
}

async function uploadFile(i: number, file: File) {
  uploadingIndex.value = i
  uploadError.value = null
  try {
    const form = new FormData()
    form.append('file', file, file.name || 'photo.jpg')
    const res = await $fetch<{ url: string }>('/api/admin/upload-photo', {
      method: 'POST',
      body: form,
    })
    coaches.value[i].photo_url = res.url
    emit()
  } catch (err: any) {
    uploadError.value = i
    uploadErrorMsg.value = err?.data?.message ?? err?.message ?? ''
  } finally {
    uploadingIndex.value = null
  }
}
</script>
