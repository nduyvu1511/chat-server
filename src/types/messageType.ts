import { ObjectId } from "mongodb"
import { IAttachment, Lnglat } from "./commonType"
import { IUser } from "./userType"

export type AttachmentType = "image" | "video" | "voice"

export interface MessageTag {
  _id: string
  text: string
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

export type MessageReply = {
  author: AuthorMessage
  message_id: ObjectId
  message_text: string
  created_at: Date
  attachment?: IAttachment | null
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
    message_id: ObjectId
    attachment_id?: ObjectId
  }
  read_by_user_ids: string[]
  is_hidden: boolean
  is_deleted: boolean
  is_edited: boolean
  liked_by_user_ids: {
    user_id: string
    emotion: MessageEmotionType
  }[]
  created_at: Date
  updated_at: Date
}

export type MessagePopulate = Omit<IMessage, "user_id" | "reply_to" | "tags"> & {
  user_id: IUser
  is_author: boolean
  is_liked: boolean
  reply_to?:
    | {
        message_id: Omit<IMessage, "user_id"> & {
          user_id: IUser
        }
        attachment_id?: IAttachment
      }
    | undefined

  tags?: MessageTag[]
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
  tag?: MessageTag[]
}

export type SendMessage = Pick<IMessage, "text" | "room_id"> & {
  tag_ids?: ObjectId[]
  attachment_ids?: ObjectId[]
  location?: Lnglat
  reply_to?: {
    message_id: ObjectId
    attachment_id?: ObjectId
  }
}

export interface SendMessageServiceParams {
  user: IUser
  message: SendMessage
}
