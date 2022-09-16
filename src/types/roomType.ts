import { ObjectId } from "mongodb"
import { AttachmentId, AttachmentRes, IAttachment, ListRes, QueryCommonParams } from "./commonType"
import { MessagePopulate, MessageRes } from "./messageType"
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

export type RoomDetailRes = Omit<RoomRes, "message_unread_count"> & {
  // offline_at: Date
  messages_pinned: MessageRes[]
  messages: MessageRes[]
  members: RoomMemberRes[]
  leader_user_info: RoomMemberRes | null
}

export type RoomQueryDetailRes = Omit<RoomRes, "message_unread_count" | "last_message"> & {
  messages_pinned: ListRes<MessageRes[]>
  messages: ListRes<MessageRes[]>
  members: ListRes<RoomMemberRes[]>
  leader_user_info: RoomMemberRes | null
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

export type LastMessage = Pick<
  MessageRes,
  "message_id" | "message_text" | "is_author" | "author" | "created_at" | "room_id"
>

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
