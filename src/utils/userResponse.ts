import { AuthorMessage, IUser, UserRes } from "../types"

export const toUserResponse = (data: IUser): UserRes => {
  return {
    phone: data?.phone,
    avatar: data?.avatar,
    gender: data?.gender,
    bio: data?.bio,
    role: data?.role,
    user_name: data?.user_name,
    date_of_birth: data?.date_of_birth,
    is_online: data?.is_online,
    updated_at: data?.updated_at,
    created_at: data?.created_at,
    user_id: data?._id,
    offline_at: data.offline_at,
  }
}

export const toAuthorMessage = (data: IUser): AuthorMessage => {
  return {
    author_id: data._id,
    author_name: data?.user_name || "",
    author_avatar: data?.avatar || "",
  }
}

export const toUserListResponse = (data: IUser[]): UserRes[] => {
  return data.map((item) => toUserResponse(item))
}
