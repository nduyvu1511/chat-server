import {
  IRoom,
  IUser,
  RoomDetailMember,
  RoomDetailQueryRes,
  RoomDetailRes,
  RoomRes,
} from "../types"
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

export const toRoomDetailResponse = (data: RoomDetailQueryRes): RoomDetailRes => {
  return {
    ...toRoomResponse(data),
    is_online: data.is_online,
    offline_at: data.offline_at,
    messages: toMessageListResponse(data.messages),
    pinned_message: data?.pinned_message ? toMessageResponse(data.pinned_message) : null,
  }
}

export const toRoomMemberListResponse = (data: IUser[]): RoomDetailMember[] => {
  return data.map((item) => ({
    user_id: item._id,
    avatar: item?.avatar || "",
    bio: item?.bio || "",
    user_name: item?.user_name || "",
    date_of_birth: item.date_of_birth || "",
    gender: item?.gender || "",
  }))
}
