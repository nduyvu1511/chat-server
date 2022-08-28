import { IUser, PartnerRes, UserRes } from "../types"

export const getUserResponse = (data: IUser): UserRes => {
  return {
    user_id: data?._id,
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
  }
}

export const getPartnerListResponse = (data: IUser[]): PartnerRes[] => {
  return data.map((item) => ({
    user_id: item?._id,
    phone: item?.phone,
    avatar: item?.avatar,
    gender: item?.gender,
    bio: item?.bio,
    user_name: item?.user_name,
    date_of_birth: item?.date_of_birth,
    is_online: item?.is_online,
    offline_at: item?.offline_at,
  }))
}

export const getPartnerResponse = (data: IUser): PartnerRes => ({
  user_id: data?._id,
  phone: data?.phone,
  avatar: data?.avatar,
  gender: data?.gender,
  bio: data?.bio,
  user_name: data?.user_name,
  date_of_birth: data?.date_of_birth,
  is_online: data?.is_online,
  offline_at: data?.offline_at,
})
