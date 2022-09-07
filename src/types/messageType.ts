import { ObjectId } from "mongodb"
import { IAttachment, Lnglat } from "./commonType"
import { IUser } from "./userType"

export type AttachmentType = "image" | "video" | "voice"

export interface Tag {
  _id: string
  text: string
  created_at: Date
}

export interface AuthorMessage {
  author_id: ObjectId
  author_name: string
  author_avatar: string
}

export interface MessageUser {
  user_id: ObjectId
  user_name: string
  user_avatar: string
}

export interface MessageReply {
  attachment?: IAttachment
  author: AuthorMessage
  message_text: string
}

export type MessageEmotionType = "like" | "angry" | "sad" | "laugh" | "heart" | "wow"

export interface IMessage {
  _id: ObjectId
  user_id: ObjectId
  room_id: ObjectId
  text: string
  tag_ids: string[]
  location: Lnglat
  attachments: IAttachment[]
  reply_to: {
    user_id: string
    message_id: string
    attachment_id?: string
  }
  read_by_user_ids: string[]
  is_hidden: boolean
  is_deleted: boolean
  is_edited: boolean
  liked_by_user_ids: {
    user_id: string
    emotion: MessageEmotionType
  }
  created_at: Date
  updated_at: Date
}

export type MessageQuery = Pick<
  IMessage,
  | "_id"
  | "attachments"
  | "created_at"
  | "updated_at"
  | "is_deleted"
  | "is_edited"
  | "is_hidden"
  | "location"
  | "room_id"
  | "text"
> & {
  is_author: boolean
  author: IUser
  is_liked: boolean
  like_count: number
  reply_to?: MessageReply
  tags?: Tag[]
  read_by?: IUser[]
}

export type MessageRes = Pick<IMessage, "room_id" | "attachments" | "created_at"> & {
  message_id: ObjectId
  is_author: boolean
  author: AuthorMessage
  is_liked: boolean
  like_count: number
  message_text: string
  reply_to?: MessageReply | null
  location?: Lnglat | null
  tag?: Tag[]
}

export type SendMessage = Pick<IMessage, "text" | "room_id"> & {
  tag_ids?: ObjectId[]
  attachment_ids?: ObjectId[]
  location?: Lnglat
  reply_to?: {
    user_id: string
    message_id: string
    attachment_id?: string
  }
}

export interface SendMessageServiceParams {
  user: IUser
  message: SendMessage
}
