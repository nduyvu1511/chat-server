import { AuthorMessage, UserPopulate, UserRes } from "../types"
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

export const toAuthorMessage = (data: UserPopulate): AuthorMessage => {
  return {
    author_id: data._id,
    author_name: data?.user_name || "",
    author_avatar: toAttachmentResponse(data?.avatar_id),
  }
}

export const toUserListResponse = (data: UserPopulate[]): UserRes[] => {
  return data.map((item) => toUserResponse(item))
}
