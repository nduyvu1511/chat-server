import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { IUser, PartnerRes, UserRes } from "../types"

export const getUserResponse = (data: IUser): UserRes => {
  return {
    _id: data._id,
    user_id: data?.user_id,
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
  return data.map((item) => getPartnerResponse(item))
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

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { _id: user._id, user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET + ""
  )
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}
