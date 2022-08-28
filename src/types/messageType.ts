import { ObjectId } from "mongodb"
import { Attachment, Lnglat } from "./commonType"

export type AttachmentType = "image" | "video" | "voice"

export interface Tag {
  _id: string
  text: string
  created_at: number
}

export type MessageEmotionType = "like" | "angry" | "sad" | "laugh" | "heart" | "wow"

export interface IMessage {
  user_id: ObjectId
  room_id: ObjectId
  text: string
  tag_ids: string[]
  location: Lnglat
  attachments: Attachment[]
  reply_to: {
    user_id: string
    message_id: string
    attachment_id?: string
  }
  read_by_user_ids: string[]
  is_hidden: boolean
  is_deleted: boolean
  is_edited: boolean
  liked_by_member_ids: {
    user_id: string
    emotion: MessageEmotionType
  }
  created_at: number
  updated_at: number
}

export type MessageRes = Pick<
  IMessage,
  | "user_id"
  | "room_id"
  | "attachments"
  | "is_hidden"
  | "reply_to"
  | "location"
  | "text"
  | "created_at"
  | "updated_at"
> & {
  is_author: boolean
  author: {
    author_id: string
    author_name: string
    author_avatar: string
  }
  is_liked: string
  like_count: number
}
