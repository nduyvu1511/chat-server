export type AttachmentType = "image" | "video" | "voice"

export interface Message {
  _id: string
  image: string
  forwarded_from: string
  type: AttachmentType
  reply_to: {
    message_id: string
    user_id: number
  }
}

export interface Tag {
  _id: string
  text: string
  created_at: number
}
