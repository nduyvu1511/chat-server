import { ObjectId } from "mongodb"
import { AttachmentId, QueryCommonParams } from "./commonType"
import { MessageQuery, MessageRes } from "./messageType"
import { IUser } from "./userType"

type RoomType = "group" | "private" | "admin"

export interface RoomMember {
  user_id: ObjectId
  joined_at: number
}

export interface RoomMemberWithId {
  _id: ObjectId
  member_ids: RoomMember[]
}

export interface LastMessage {
  message_id: ObjectId
  room_id: ObjectId
  created_at: Date
  content: string
}

export interface IRoom {
  _id: ObjectId
  room_name: string
  room_avatar: AttachmentId
  room_type: RoomType
  member_ids: RoomMember[]
  leader_member_id: ObjectId
  last_message: LastMessage
  message_pinned_ids: ObjectId[]
  members_leaved: {
    member_id: ObjectId
    leaved_at: number
  }
  message_ids: ObjectId[]
  is_online: boolean
  offline_at: Date
  is_expired: boolean
  created_at: Date
  deleted_at: Date
  updated_at: Date
}

export interface CreateRoomChatParams {
  partner_id: ObjectId
}

export interface CreateGroupChatParams {
  room_name: Pick<IRoom, "room_name">
  room_avatar?: AttachmentId
  member_ids: number[]
}

export type CreateGroupChatServicesParams = Pick<
  CreateGroupChatParams,
  "room_avatar" | "room_name"
> & {
  member_ids: ObjectId[]
}

export type CreatePrivateChatServicesParams = {
  partner: IUser
  user: IUser
}

export interface RoomRes {
  room_id: ObjectId
  room_name: string
  room_avatar?: string
  room_type: RoomType
  member_count: number
  last_message?: LastMessage | null
  create_at: Date
}

export interface QueryRoomParams extends QueryCommonParams {
  search_term?: string
}

export interface QueryRoomServiceParams extends QueryRoomParams {
  room_ids: string[]
}

export interface QueryMembersInRoomService extends QueryCommonParams {
  room_id: ObjectId
}

export type RoomServiceParams = Exclude<IRoom, "last_message" | ""> & {
  message?: MessageQuery
}

export type RoomDetailMember = Pick<IUser, "bio" | "date_of_birth" | "gender" | "user_name"> & {
  user_id: ObjectId
  avatar: string
}

export interface RoomDetailRes extends RoomRes {
  pinned_message: MessageRes | null
  is_online: boolean
  offline_at: Date
  messages: MessageRes[]
}

export type RoomDetailQueryRes = IRoom & {
  pinned_message?: MessageQuery
  messages: MessageQuery[]
}

export interface GetRoomDetailService {
  room_id: ObjectId
  user: IUser
}
