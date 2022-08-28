import { ObjectId } from "mongodb"
import { QueryCommonParams } from "./commonType"
import { MessageRes } from "./messageType"
import { IUser } from "./userType"

type RoomType = "group" | "private" | "admin"

export interface IRoom {
  room_name: string
  room_avatar: {
    attachment_id: ObjectId
    url: string
  }
  room_type: RoomType
  member_ids: {
    user_id: ObjectId
    joined_at: number
  }[]
  leader_member_id: ObjectId
  last_message_id: ObjectId
  message_pinned_ids: ObjectId[]
  members_leaved: {
    member_id: ObjectId
    leaved_at: number
  }
  is_expired: boolean
  created_at: Date
  deleted_at: Date
  updated_at: Date
}

export interface CreateRoomChatParams {
  partner_id: ObjectId
}

export interface CreateGroupChatParams {
  room_name?: Pick<IRoom, "room_name">
  room_avatar?: Pick<IRoom, "room_avatar">
  member_ids: ObjectId[]
}

export type CreateGroupChatServicesParams = Pick<
  CreateGroupChatParams,
  "room_name" | "room_avatar"
> & {
  member_ids: IUser[]
}

export type CreatePrivateChatServicesParams = {
  partner: IUser
  user: IUser
}

export interface RoomRes {
  room_id: ObjectId
  room_name: string
  room_avatar?: Pick<IRoom, "room_avatar">
  room_type: RoomType
  member_count: number
  last_message: MessageRes
  is_online: boolean
  offline_at: string
}

export interface QueryRoomParams extends QueryCommonParams {
  search_term?: string
}

export interface QueryRoomServiceParams extends QueryRoomParams {
  room_ids: string[]
}

export interface RoomDetailRes {}
