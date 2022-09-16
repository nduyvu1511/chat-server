import { AuthorMessage, UserData, UserPopulate, UserRes } from "../types"
import { toAttachmentResponse } from "./commonResponse"

export const toUserResponse = (data: UserPopulate): UserRes => {
  return {
    user_id: data?._id,
    user_name: data?.user_name,
    phone: data?.phone,
    avatar: toAttachmentResponse(data.avatar_id),
    gender: data?.gender,
    bio: data?.bio,
    role: data?.role,
    date_of_birth: data?.date_of_birth,
    is_online: data?.is_online,
    offline_at: data.offline_at,
    updated_at: data?.updated_at,
    created_at: data?.created_at,
  }
}

export const toUserDataReponse = (data: UserPopulate): UserData => {
  return {
    ...toUserResponse(data),
    user_chatted_with_ids: (data?.user_chatted_with_ids || []) as any,
    room_joined_ids: data?.room_joined_ids || [],
    room_blocked_noti_ids: data?.room_blocked_noti_ids || [],
  }
}

export const toAuthorMessage = (data: UserPopulate): AuthorMessage => {
  return {
    author_id: data._id,
    author_name: data?.user_name || "",
    author_avatar: toAttachmentResponse(data?.avatar_id),
    author_socket_id: data.socket_id,
  }
}

export const toUserListResponse = (data: UserPopulate[]): UserRes[] => {
  return data.map((item) => toUserResponse(item))
}
