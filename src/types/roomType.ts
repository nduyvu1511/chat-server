import { ObjectId } from "mongodb"
import { ListRes, Lnglat, QueryCommonParams } from "./commonType"
import { LastMessage, MessagePopulate, MessageRes } from "./messageType"
import { IUser, UserPopulate } from "./userType"

export interface IRoom {
  _id: ObjectId
  room_name: string
  room_avatar: string
  room_type: RoomType
  member_ids: RoomMember[]
  leader_id: ObjectId
  last_message_id?: ObjectId
  pinned_message_ids: ObjectId[]
  members_leaved: MemberLeaved[]
  compounding_car_id: number
  message_ids: ObjectId[]
  is_deleted: boolean
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
 *        has_more:
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
 *        - room_id
 *        - room_name
 *        - room_avatar
 *        - room_type
 *        - is_online
 *        - member_count
 *        - message_unread_count
 *        - last_message
 *        - top_members
 *      properties:
 *       room_id:
 *        type: string
 *       compounding_car_id:
 *        type: string
 *       room_name:
 *        type: string
 *       room_avatar:
 *        type: string
 *       room_type:
 *        type: string
 *        enum: [group, single, admin]
 *       is_online:
 *        type: boolean
 *       member_count:
 *        type: number
 *       message_unread_count:
 *        type: number
 *       last_message:
 *        $ref: '#/components/schema/LastMessageRes'
 *       top_members:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            avatar:
 *              type: string
 *            user_name:
 *              type: string
 *            user_id:
 *              type: string
 *            is_online:
 *              type: boolean
 */
export interface RoomRes {
  room_id: ObjectId
  compounding_car_id: number | null
  room_name: string | null
  room_avatar?: string | null
  room_type: RoomType
  is_online: boolean
  member_count: number
  message_unread_count: number
  last_message?: LastMessage | null
  top_members?: {
    user_avatar: string
    user_name: string
    user_id: ObjectId
    is_online: boolean
  }[]
}

/**
 * @openapi
 * components:
 *  schema:
 *    RoomInfoRes:
 *      type: object
 *      required:
 *        - room_id
 *        - room_name
 *        - room_avatar
 *        - room_type
 *        - member_count
 *        - created_at
 *      properties:
 *       room_id:
 *        type: string
 *       room_name:
 *        type: string
 *       room_avatar:
 *        type: string
 *       room_type:
 *        type: string
 *        enum: [group, single, admin]
 *       member_count:
 *        type: number
 *       created_at:
 *        type: Date
 */
export interface RoomInfoRes {
  room_id: ObjectId
  room_name: string | null
  room_avatar?: string | null
  room_type: RoomType
  member_count: number
}

export interface LastMessagePopulate {
  text: string
  location: Lnglat | null
  attachment_ids: string[]
  message_id: ObjectId
  user_name: string
  user_id: ObjectId
  created_at: Date
}

export type RoomPopulate = Pick<IRoom, "room_type" | "room_name"> & {
  member_count: number
  room_id: ObjectId
  compounding_car_id: number | null
  room_avatar?: string
  top_members: {
    user_id: ObjectId
    user_avatar: string
    user_name: string
    is_online: boolean
  }[]
  last_message?: LastMessagePopulate
  message_unread_count: string[]
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

export type RoomDetailRes = Omit<
  RoomRes,
  "message_unread_count" | "last_message" | "room_avatar"
> & {
  offline_at: Date | null
  room_avatar: string | null
  // pinned_messages: ListRes<MessageRes[]>
  messages: ListRes<MessageRes[]>
  members: ListRes<RoomMemberRes[]>
  // leader_info: RoomMemberRes | null
}

/**
 * @openapi
 * components:
 *  schema:
 *    RoomDetailRes:
 *      type: object
 *      required:
 *       - room_id
 *       - room_name
 *       - room_type
 *       - is_online
 *       - member_count
 *       - messages
 *       - members
 *      properties:
 *       room_id:
 *        type: string
 *       room_name:
 *        type: string
 *       room_avatar:
 *        type: string
 *       room_type:
 *        type: string
 *        enum: [group, single, admin]
 *       is_online:
 *        type: boolean
 *       offline_at:
 *        type: date,
 *        format: YYYY-MM-DD
 *       member_count:
 *        type: number
 *       messages:
 *          $ref: '#components/schema/MessageListRes'
 *       members:
 *          $ref: '#components/schema/RoomMemberListRes'
 */

// pinned_messages:
// $ref: '#components/schema/MessageListRes'
// leader_info:
// $ref: '#components/schema/RoomMemberListRes'

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
 *        has_more:
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

export type RoomDetailPopulate = Omit<
  IRoom,
  "member_ids" | "pinned_message_ids" | "message_ids" | "leader_id"
> & {
  member_ids: ListRes<UserPopulate[]>
  pinned_message_ids?: ListRes<MessagePopulate[]>
  message_ids: ListRes<MessagePopulate[]>
  leader_id?: UserPopulate
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

export type UpdateRoomInfo = Partial<Pick<IRoom, "room_name" | "room_avatar">> & {}

export type UpdateRoomInfoService = UpdateRoomInfo & {
  room_id: string
}

export interface RoomMemberWithId {
  _id: ObjectId
  member_ids: RoomMember[]
}

export interface createSingleChat {
  partner_id: number
  compounding_car_id: number
}

export interface CreateGroupChat {
  room_name: Pick<IRoom, "room_name">
  room_avatar?: string
  member_ids: number[]
  compounding_car_id: number
}

export type CreateGroupChatServicesParams = Pick<CreateGroupChat, "room_avatar" | "room_name"> & {
  member_ids: ObjectId[]
  compounding_car_id: number
}

export type CreateSingleChatService = {
  partner: IUser
  user: IUser
  compounding_car_id?: number
  room_type?: "single" | "admin"
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
  avatar: string | null
  socket_id: string | null
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

export interface AddMemberInRoomService {
  user: IUser
  room: IRoom
}

export interface DeleteMemberFromRoomService extends AddMemberInRoomService {}

export interface AddMessageUnread {
  message_id: ObjectId
}

export interface AddMessageUnreadService extends AddMessageUnread {
  room_id: ObjectId
  user_id: ObjectId
}

export interface RoomTypingRes {
  user_id: string
  user_name: string
  room_id: string
}

export interface GetRoomIdByUserId {
  room_joined_ids: ObjectId[]
  partner_id: ObjectId
  compounding_car_id: number
}

export interface SoftDeleteRoomsByCompoundingCarId {
  compounding_car_id: number
  current_user_id: ObjectId
}
