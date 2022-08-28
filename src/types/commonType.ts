export interface ResponseType<T> {
  message: string
  success: boolean
  error_code: number
  data: T
}

export interface QueryCommonParams {
  limit: number
  offset: number
}

export interface ListRes<T> {
  hasMore: boolean
  limit: number
  offset: number
  total: number
  data: T
}

export interface Lnglat {
  lng: string
  lat: string
}

type AttachmentType = "image" | "video" | "voice"

export interface Attachment {
  _id: string
  url: string
  thumbnail_url: string
  desc: string
  attachment_type: AttachmentType
  created_at: number
}
