import { ObjectId } from "mongodb"
import { AttachmentRes, IAttachment, ITag, Lnglat, QueryCommonParams, TagRes } from "./commonType"
import { IUser, UserPopulate } from "./userType"

export interface IMessage {
  _id: ObjectId
  user_id: ObjectId
  room_id: ObjectId
  text: string
  tag_ids: ObjectId[]
  location: Lnglat
  attachment_ids: IAttachment[]
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

export type MessagePopulate = Omit<
  IMessage,
  "user_id" | "reply_to" | "tag_ids" | "attachment_ids"
> & {
  user_id: UserPopulate
  reply_to?:
    | {
        message_id: Omit<IMessage, "user_id"> & {
          user_id: UserPopulate
        }
        attachment_id?: IAttachment
      }
    | undefined
  tag_ids?: ITag[]
  attachment_ids: IAttachment[]
}

export type ToMessageResponse = {
  data: MessagePopulate
  current_user: IUser
}

export interface GetMessage {
  message_id: ObjectId
  current_user: IUser
}

export type ToMessageListResponse = {
  data: MessagePopulate[]
  current_user: IUser
}

export type MessageRes = Pick<IMessage, "room_id" | "created_at"> & {
  message_id: ObjectId
  is_author: boolean
  author: AuthorMessage
  is_liked: boolean
  attachments: AttachmentRes[]
  like_count: number
  message_text: string
  reply_to?: MessageReply | null
  location?: Lnglat | null
  tags?: TagRes[]
}

export type AttachmentType = "image" | "video" | "voice"

export interface AuthorMessage {
  author_id: ObjectId
  author_name: string
  author_avatar: AttachmentRes
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
  attachment?: AttachmentRes | null
}

export type MessageEmotionType = "like" | "angry" | "sad" | "laugh" | "heart" | "wow"

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
  room_id: ObjectId
  user: IUser
  message: SendMessage
}

export interface GetMessagesInRoom extends QueryCommonParams {
  room_id: ObjectId
}
