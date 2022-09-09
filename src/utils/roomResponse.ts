import {
  IUser,
  RoomDetailRes,
  RoomMemberRes,
  RoomRes,
  ToRoomDetailResponse,
  ToRoomListResponse,
  ToRoomRepsonse,
  UserPopulate,
} from "../types"
import { toAttachmentResponse } from "./commonResponse"
import { toLastMessageResponse, toMessageListResponse } from "./messageResponse"

export const toRoomResponse = ({ data, current_user }: ToRoomRepsonse): RoomRes => {
  return {
    room_id: data._id,
    room_name: data?.room_name || "",
    room_type: data.room_type,
    room_avatar: data?.room_avatar_id?._id ? toAttachmentResponse(data.room_avatar_id) : null,
    member_count: data.member_ids?.length || 0,
    create_at: data?.created_at,
    last_message: data?.last_message_id?._id
      ? toLastMessageResponse({
          data: data.last_message_id,
          current_user,
        })
      : null,
  }
}

export const toRoomListResponse = ({ current_user, data }: ToRoomListResponse): RoomRes[] => {
  return data.map((item) => toRoomResponse({ data: item, current_user }))
}

export const toRoomDetailResponse = ({
  data,
  current_user,
}: ToRoomDetailResponse): RoomDetailRes => {
  return {
    create_at: data?.created_at,
    member_count: data?.member_ids?.length || 0,
    room_id: data._id,
    room_name: data?.room_name || null,
    room_type: data.room_type,
    room_avatar: data?.room_avatar_id ? toAttachmentResponse(data.room_avatar_id) : null,
    leader_user_info: data.leader_id ? toRoomMemberResponse(data.leader_id) : null,
    messages_pinned: data?.message_pinned_ids?.length
      ? toMessageListResponse({
          data: data.message_pinned_ids,
          current_user,
        })
      : [],
    messages: data?.message_ids?.length
      ? toMessageListResponse({
          data: data.message_ids,
          current_user,
        })
      : [],
    members: toRoomMemberListResponse(data.member_ids),
  }
}

export const toRoomMemberResponse = (data: UserPopulate): RoomMemberRes => ({
  user_id: data._id,
  avatar: toAttachmentResponse(data.avatar_id),
  user_name: data?.user_name || "",
  phone: data.phone,
  bio: data?.bio || "",
  date_of_birth: data.date_of_birth || "",
  gender: data?.gender || "",
  is_online: data?.is_online || false,
})

export const toRoomMemberListResponse = (data: UserPopulate[]): RoomMemberRes[] => {
  return data.map((item) => toRoomMemberResponse(item))
}
