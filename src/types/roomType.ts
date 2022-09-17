import { ObjectId } from "mongodb"
import { AttachmentId, AttachmentRes, IAttachment, ListRes, QueryCommonParams } from "./commonType"
import { LastMessage, MessagePopulate, MessageRes } from "./messageType"
import { IUser, UserPopulate } from "./userType"

export interface IRoom {
  _id: ObjectId
  room_name: string
  room_avatar_id: ObjectId
  room_single_member_ids: ObjectId[]
  room_type: RoomType
  member_ids: RoomMember[]
  leader_id: ObjectId
  last_message_id?: ObjectId
  pinned_message_ids: ObjectId[]
  members_leaved: MemberLeaved
  message_ids: ObjectId[]
  is_expired: boolean
  created_at: Date
  deleted_at: Date
  updated_at: Date
}

/**
 * @openapi
 * components:
 *  schema:
 *    RoomListRes:
 *      type: object
 *      properties:
 *        hasMore:
 *         type: boolean
 *        limit:
 *         type: number
 *        offset:
 *         type: number
 *        total:
 *         type: number
 *        data:
 *          type: array
 *          items:
 *           $ref: '#components/schema/RoomRes'
 */

/**
 * @openapi
 * components:
 *  schema:
 *    RoomRes:
 *      type: object
 *      required:
 *       room_id
 *       room_name
 *       room_type
 *       is_online
 *       member_online_count
 *       member_count
 *       message_unread_count
 *      properties:
 *       room_id:
 *        type: string
 *       room_name:
 *        type: string
 *       room_avatar:
 *        $ref: '#/components/schema/AttachmentRes'
 *       room_type:
 *        type: string
 *        enum: [group, single, admin]
 *       is_online:
 *        type: boolean
 *       member_online_count:
 *        type: number
 *       offline_at:
 *        type: date,
 *        format: YYYY-MM-DD
 *       member_count:
 *        type: number
 *       message_unread_count:
 *        type: number
 *       last_message:
 *        $ref: '#/components/schema/LastMessageRes'
 */
export interface RoomRes {
  room_id: ObjectId
  room_name: string | null
  room_avatar?: AttachmentRes | null
  room_type: RoomType
  is_online: boolean
  member_online_count: number
  offline_at: Date | null
  member_count: number
  message_unread_count: number
  last_message?: LastMessage | null
}

export type RoomPopulate = Omit<
  IRoom,
  "last_message_id" | "room_avatar_id" | "room_single_member_ids" | "member_ids"
> & {
  last_message_id?: MessagePopulate
  room_avatar_id?: IAttachment
  room_single_member_ids: {
    _id: ObjectId
    user_name: string
    avatar_id: IAttachment
  }[]
  member_ids: MemberRoomPopulate[]
}

export type MemberRoomPopulate = {
  user_id: IUser
  joined_at: Date
  message_unread_ids: ObjectId[]
}

export type ToRoomRepsonse = {
  data: RoomPopulate
  current_user: IUser
}

export type ToRoomListResponse = {
  data: RoomPopulate[]
  current_user: IUser
}

export type RoomDetailRes = Omit<RoomRes, "message_unread_count" | "last_message"> & {
  pinned_messages: MessageRes[]
  messages: MessageRes[]
  members: RoomMemberRes[]
  leader_info: RoomMemberRes | null
}

/**
 * @openapi
 * components:
 *  schema:
 *    RoomDetailRes:
 *      type: object
 *      required:
 *       room_id
 *       room_name
 *       room_type
 *       is_online
 *       member_online_count
 *       member_count
 *       message_unread_count
 *      properties:
 *       room_id:
 *        type: string
 *       room_name:
 *        type: string
 *       room_avatar:
 *        $ref: '#/components/schema/AttachmentRes'
 *       room_type:
 *        type: string
 *        enum: [group, single, admin]
 *       is_online:
 *        type: boolean
 *       member_online_count:
 *        type: number
 *       offline_at:
 *        type: date,
 *        format: YYYY-MM-DD
 *       member_count:
 *        type: number
 *        messages:
 *          $ref: '#components/schema/MessageListRes'
 *        pinned_messages:
 *          $ref: '#components/schema/MessageListRes'
 *        members:
 *          $ref: '#components/schema/RoomMemberListRes'
 *        leader_info:
 *          $ref: '#components/schema/RoomMemberListRes'
 */

/**
 * @openapi
 * components:
 *  schema:
 *    RoomMemberListRes:
 *      type: object
 *      required:
 *       offset
 *       limit
 *       total
 *       data
 *      properties:
 *        hasMore:
 *         type: boolean
 *        limit:
 *         type: number
 *        offset:
 *         type: number
 *        total:
 *         type: number
 *        data:
 *          type: array
 *          items:
 *           $ref: '#components/schema/RoomMemberRes'
 */

export type RoomQueryDetailRes = Omit<RoomRes, "message_unread_count" | "last_message"> & {
  pinned_messages: ListRes<MessageRes[]>
  messages: ListRes<MessageRes[]>
  members: ListRes<RoomMemberRes[]>
  leader_info: RoomMemberRes | null
}

export type RoomDetailPopulate = Omit<
  IRoom,
  "member_ids" | "pinned_message_ids" | "message_ids" | "leader_id" | "room_avatar_id"
> & {
  member_ids: UserPopulate[]
  pinned_message_ids?: MessagePopulate[]
  message_ids: MessagePopulate[]
  leader_id?: UserPopulate
  room_avatar_id?: IAttachment
}

export type ToRoomDetailResponse = {
  current_user: IUser
  data: RoomDetailPopulate
}

export interface GetRoomDetailService {
  room_id: ObjectId
  user: IUser
}

type RoomType = "group" | "single" | "admin"

export interface RoomMember {
  user_id: ObjectId
  joined_at: number
  message_unread_ids: ObjectId[]
}

export interface MemberLeaved {
  user_id: ObjectId
  leaved_at: number
}

export interface RoomMemberWithId {
  _id: ObjectId
  member_ids: RoomMember[]
}

export interface createSingleChat {
  partner_id: number
}

export interface CreateGroupChat {
  room_name: Pick<IRoom, "room_name">
  room_avatar_id?: AttachmentId
  member_ids: number[]
}

export type CreateGroupChatServicesParams = Pick<
  CreateGroupChat,
  "room_avatar_id" | "room_name"
> & {
  member_ids: ObjectId[]
}

export type createSingleChatServices = {
  partner: IUser
  user: IUser
}

export interface QueryRoomParams extends QueryCommonParams {
  search_term?: string
}

export interface QueryMembersInRoomParams extends QueryCommonParams {
  search_term?: string
}

export interface QueryRoomServiceParams extends QueryRoomParams {
  room_ids: string[]
  current_user: IUser
}

export interface QueryMembersInRoomService extends QueryCommonParams {
  room_id: ObjectId
}

export type RoomServiceParams = Exclude<IRoom, "last_message" | ""> & {
  message?: MessagePopulate
}

/**
 * @openapi
 * components:
 *  schema:
 *    RoomMemberRes:
 *      type: object
 *      required:
 *        - user_id
 *        - bio
 *        - avatar
 *        - gender
 *        - date_of_birth
 *        - is_online
 *        - user_name
 *        - phone
 *        - offline_at
 *      properties:
 *       user_id:
 *        type: string
 *       bio:
 *        type: string
 *       avatar:
 *        $ref: '#/components/schema/AttachmentRes'
 *       date_of_birth:
 *        type: string
 *        format: YYYY-MM-DD
 *       gender:
 *        type: string
 *        enum: [male, female, no_info]
 *       is_online:
 *        type: boolean
 *       user_name:
 *        type: string
 *       phone:
 *        type: string
 *       offline_at:
 *        type: date
 */
export type RoomMemberRes = Pick<
  IUser,
  "bio" | "gender" | "date_of_birth" | "is_online" | "user_name" | "phone" | "offline_at"
> & {
  user_id: ObjectId
  avatar: AttachmentRes
}

export type RoomDetailQueryRes = IRoom & {
  pinned_message?: MessagePopulate
  messages: MessagePopulate[]
}

export interface ToRoomStatus {
  data: IUser[]
  current_user: IUser
}

export interface ClearMessageUnread {
  room_id: ObjectId
}

export interface ClearMessageUnreadService extends ClearMessageUnread {
  user_id: ObjectId
}

export interface AddMessageUnread {
  message_id: ObjectId
}

export interface AddMessageUnreadService extends AddMessageUnread {
  room_id: ObjectId
  user_id: ObjectId
}
