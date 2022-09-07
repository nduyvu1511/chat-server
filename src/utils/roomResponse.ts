import { IRoom, IUser, RoomDetailPopulate, RoomDetailRes, RoomMemberRes, RoomRes } from "../types"
import { toMessageListResponse, toMessageResponse } from "./messageResponse"

export const toRoomResponse = (data: IRoom): RoomRes => {
  return {
    room_id: data._id,
    room_name: data?.room_name || "",
    room_type: data.room_type,
    room_avatar: data?.room_avatar?.url || "",
    member_count: data.member_ids?.length || 0,
    create_at: data?.created_at,
    last_message: data?.last_message || null,
  }
}

export const toRoomListResponse = (data: IRoom[]): RoomRes[] => {
  return data.map((item) => toRoomResponse(item))
}

export const toRoomDetailResponse = (data: RoomDetailPopulate): RoomDetailRes => {
  return {
    ...toRoomResponse(data as any),
    messages: toMessageListResponse(data.message_ids),
    pinned_messages: data?.message_pinned_ids?.length
      ? toMessageListResponse(data.message_pinned_ids)
      : [],
    members: toRoomMemberListResponse(data.member_ids),
  }
}

export const toRoomMemberResponse = (data: IUser): RoomMemberRes => ({
  user_id: data._id,
  avatar: data?.avatar || "",
  user_name: data?.user_name || "",
  phone: data.phone,
  bio: data?.bio || "",
  date_of_birth: data.date_of_birth || "",
  gender: data?.gender || "",
  is_online: data.is_online,
})

export const toRoomMemberListResponse = (data: IUser[]): RoomMemberRes[] => {
  return data.map((item) => toRoomMemberResponse(item))
}
