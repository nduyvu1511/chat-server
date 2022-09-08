import { ObjectId } from "mongodb"
import { AttachmentId, AttachmentRes, IAttachment, ListRes, QueryCommonParams } from "./commonType"
import { MessagePopulate, MessageRes } from "./messageType"
import { IUser } from "./userType"

export interface IRoom {
  _id: ObjectId
  room_name: string
  room_avatar_id: ObjectId
  room_type: RoomType
  member_ids: RoomMember[]
  leader_id: ObjectId
  last_message_id?: ObjectId
  message_pinned_ids: ObjectId[]
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
  member_count: number
  last_message?: LastMessage | null
  create_at: Date
}

export type RoomPopulate = Omit<IRoom, "last_message_id" | "room_avatar_id"> & {
  last_message_id?: MessagePopulate
  room_avatar_id?: IAttachment
}

export type ToRoomRepsonse = {
  data: RoomPopulate
  current_user_id: ObjectId
}

export type ToRoomListResponse = {
  data: RoomPopulate[]
  current_user_id: ObjectId
}

export interface RoomDetailRes extends RoomRes {
  messages_pinned: MessageRes[]
  messages: MessageRes[]
  members: RoomMemberRes[]
  leader_user_info: RoomMemberRes | null
}

export interface RoomQueryDetailRes extends RoomRes {
  messages_pinned: ListRes<MessageRes[]>
  messages: ListRes<MessageRes[]>
  members: ListRes<RoomMemberRes[]>
  leader_user_info: RoomMemberRes | null
}

// export interface RoomDetailRes extends RoomRes {
//   messages_pinned?: MessageRes[]
//   messages: ListRes<MessageRes[]>
//   members: ListRes<RoomMemberRes[]>
//   leader_user_info: RoomMemberRes | null
// }

export type RoomDetailPopulate = Omit<
  IRoom,
  "member_ids" | "message_pinned_ids" | "message_ids" | "leader_id" | "room_avatar_id"
> & {
  member_ids: IUser[]
  message_pinned_ids?: MessagePopulate[]
  message_ids: MessagePopulate[]
  leader_id?: IUser
  room_avatar_id?: IAttachment
}

export type ToRoomDetailResponse = {
  current_user_id: ObjectId
  data: RoomDetailPopulate
}

export interface GetRoomDetailService {
  room_id: ObjectId
  user: IUser
}

type RoomType = "group" | "private" | "admin"

export interface RoomMember {
  user_id: ObjectId
  joined_at: number
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
  "message_id" | "message_text" | "is_author" | "author" | "created_at"
>

export interface CreatePrivateChat {
  partner_id: number
}

export interface CreateGroupChat {
  room_name: Pick<IRoom, "room_name">
  room_avatar?: AttachmentId
  member_ids: number[]
}

export type CreateGroupChatServicesParams = Pick<CreateGroupChat, "room_avatar" | "room_name"> & {
  member_ids: ObjectId[]
}

export type CreatePrivateChatServices = {
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
  current_user_id: ObjectId
}

export interface QueryMembersInRoomService extends QueryCommonParams {
  room_id: ObjectId
}

export type RoomServiceParams = Exclude<IRoom, "last_message" | ""> & {
  message?: MessagePopulate
}

export type RoomMemberRes = Pick<
  IUser,
  "avatar" | "bio" | "gender" | "date_of_birth" | "is_online" | "user_name" | "phone"
> & {
  user_id: ObjectId
}

export type RoomDetailQueryRes = IRoom & {
  pinned_message?: MessagePopulate
  messages: MessagePopulate[]
}
