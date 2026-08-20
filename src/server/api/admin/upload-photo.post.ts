import { readMultipartFormData } from 'h3'

const UPLOAD_ENDPOINT = 'https://premiersportscamps.com/gp-upload.php'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file')
  if (!filePart?.data?.length) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const secret = process.env.UPLOAD_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Upload not configured' })
  }

  const form = new FormData()
  form.append('file', new Blob([filePart.data], { type: filePart.type ?? 'application/octet-stream' }), filePart.filename ?? 'photo.jpg')

  let res: Response
  try {
    res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'X-Upload-Secret': secret },
      body: form,
    })
  } catch (err: any) {
    throw createError({ statusCode: 502, message: `Upload connection failed: ${err?.message ?? err}` })
  }

  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))

  if (!res.ok || json.error) {
    throw createError({ statusCode: 502, message: `Upload failed: ${json.error ?? res.status}` })
  }

  return { url: json.url }
})
