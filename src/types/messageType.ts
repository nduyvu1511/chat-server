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

/**
 * @openapi
 * components:
 *  schema:
 *    LngLatRes:
 *      type: object
 *      required:
 *        - lng
 *        - lat
 *      properties:
 *        lng:
 *          type: string
 *        lat:
 *          type: string
 */

/**
 * @openapi
 * components:
 *  schema:
 *    TagListRes:
 *     type: object
 *     properties:
 *       hasMore:
 *        type: boolean
 *       limit:
 *        type: number
 *       offset:
 *        type: number
 *       total:
 *        type: number
 *       data:
 *         type: array
 *         items:
 *          $ref: '#components/schema/TagRes'
 */

/**
 * @openapi
 * components:
 *  schema:
 *    TagRes:
 *      type: object
 *      required:
 *        - tag_id
 *        - text
 *      properties:
 *        tag_id:
 *          type: string
 *        text:
 *          type: string
 */

/**
 * @openapi
 * components:
 *  schema:
 *    MessageRes:
 *      type: object
 *      required:
 *        - message_id
 *        - is_author
 *        - author
 *        - like_count
 *        - message_text
 *        - is_read
 *        - room_id
 *        - created_at
 *      properties:
 *        message_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        room_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        created_at:
 *          type: date
 *        is_author:
 *          type: boolean
 *        author:
 *          $ref: '#/components/schema/AuthorMessageRes'
 *        is_liked:
 *          type: boolean
 *        attachments:
 *          type: array
 *          items:
 *            $ref: '#/components/schema/AttachmentRes'
 *        like_count:
 *          type: number
 *        message_text:
 *          type: string
 *        reply_to:
 *          $ref: '#/components/schema/MessageReplyRes'
 *        location:
 *          $ref: '#/components/schema/LngLatRes'
 *        tags:
 *          type: array
 *          items:
 *            $ref: '#/components/schema/TagRes'
 *        is_read:
 *          type: boolean
 */
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
  is_read: boolean
}

/**
 * @openapi
 * components:
 *  schema:
 *    MessageListRes:
 *     type: object
 *     properties:
 *       hasMore:
 *        type: boolean
 *       limit:
 *        type: number
 *       offset:
 *        type: number
 *       total:
 *        type: number
 *       data:
 *         type: array
 *         items:
 *          $ref: '#components/schema/MessageRes'
 */

/**
 * @openapi
 * components:
 *  schema:
 *    LastMessageRes:
 *      type: object
 *      required:
 *        - message_id
 *        - is_author
 *        - author
 *        - message_text
 *        - room_id
 *        - created_at
 *      properties:
 *        room_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        message_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        is_author:
 *          type: boolean
 *        author:
 *          $ref: '#/components/schema/AuthorMessageRes'
 *        message_text:
 *          type: string
 *        created_at:
 *          type: date
 *          format: YYYY-MM-DD
 */
export type LastMessage = Pick<
  MessageRes,
  "message_id" | "message_text" | "is_author" | "author" | "created_at" | "room_id"
>

export type AttachmentType = "image" | "video" | "voice"

/**
 * @openapi
 * components:
 *  schema:
 *    AuthorMessageRes:
 *      type: object
 *      required:
 *        - author_id
 *        - author_name
 *        - author_avatar:
 *      properties:
 *        author_id:
 *          type: string
 *          example: 631d56c54a20bef82e479f0d
 *        author_name:
 *          type: string
 *        author_avatar:
 *          $ref: '#/components/schema/AttachmentRes'
 *        author_socket_id:
 *          type: string
 */
export interface AuthorMessage {
  author_id: ObjectId
  author_name: string
  author_avatar: AttachmentRes
  author_socket_id: string
}

export interface MessageUser {
  user_id: ObjectId
  user_name: string
  user_avatar: string
}

/**
 * @openapi
 * components:
 *  schema:
 *    MessageReplyRes:
 *      type: object
 *      required:
 *        - author
 *        - message_id
 *        - created_at
 *      properties:
 *        author:
 *          $ref: '#/components/schema/AuthorMessageRes'
 *        message_id:
 *          type: string
 *        message_text:
 *          type: string
 *        created_at:
 *          type: date
 *        attachment:
 *          $ref: '#/components/schema/AttachmentRes'
 */
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

export interface UserReadMessage {
  user_id: ObjectId
  message_id: ObjectId
}

export interface UserReadLastMessage {
  user_id: ObjectId
  room_id: ObjectId
}

export interface UnlikeMessage {
  message_id: ObjectId
}

export interface UnlikeMessageService {
  message_id: ObjectId
  user_id: ObjectId
}

/**
 * @openapi
 * components:
 *  schema:
 *    LikeMessage:
 *      type: object
 *      required:
 *        - message_id
 *        - emotion
 *      properties:
 *        message_id:
 *          type: string
 *        emotion:
 *          type: string
 *          enum: [like, angry, sad, wow, heart, laugh]
 */
export interface LikeMessage extends UnlikeMessage {
  emotion: MessageEmotionType
}

export interface LikeMessageService extends UnlikeMessageService {
  emotion: MessageEmotionType
}

/**
 * @openapi
 * components:
 *  schema:
 *    LikeMessageRes:
 *      type: object
 *      required:
 *        - message_id
 *        - emotion
 *        - user_id
 *        - room_id
 *      properties:
 *        message_id:
 *          type: string
 *        emotion:
 *          type: string
 *          enum: [like, angry, sad, wow, heart, laugh]
 *        user_id:
 *          type: string
 *        room_id:
 *          type: string
 */
export interface LikeMessageRes {
  message_id: ObjectId
  room_id: ObjectId
  user_id: ObjectId
  emotion: MessageEmotionType
}

/**
 * @openapi
 * components:
 *  schema:
 *    UnlikeMessageRes:
 *      type: object
 *      required:
 *        - message_id
 *        - user_id
 *        - room_id
 *      properties:
 *        message_id:
 *          type: string
 *        user_id:
 *          type: string
 *        room_id:
 *          type: string
 */
export interface UnlikeMessageRes {
  message_id: ObjectId
  user_id: ObjectId
  room_id: ObjectId
}
