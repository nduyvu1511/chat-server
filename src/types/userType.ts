import { ObjectId } from "mongodb"
import { QueryCommonParams } from "./commonType"

export interface IUser {
  _id: ObjectId
  user_name: string
  role: UserRole
  avatar?: string
  password: string
  bio?: string
  phone: string
  user_id: number
  date_of_birth?: string
  blocked_user_ids: number[]
  gender?: Gender
  room_joined_ids: string[]
  messages_unread: {
    room_id: ObjectId
    message_ids: ObjectId[]
  }[]
  message_unread_count: number
  created_at: Date
  updated_at: Date
  is_online: boolean
  offline_at: Date
  room_blocked_noti_ids: string[]
}

export type UserRes = Pick<
  IUser,
  | "avatar"
  | "bio"
  | "created_at"
  | "date_of_birth"
  | "gender"
  | "is_online"
  | "offline_at"
  | "role"
  | "phone"
  | "user_name"
  | "updated_at"
> & {
  user_id: ObjectId
}

export type CreateUserParams = Pick<
  IUser,
  "avatar" | "user_name" | "date_of_birth" | "gender" | "role" | "bio" | "phone" | "user_id"
> & { user_id: string }

export type UpdateProfileParams = Partial<
  Pick<IUser, "avatar" | "user_name" | "date_of_birth" | "gender" | "bio"> & { user_id: string }
>

export type GetTokenParams = Pick<IUser, "user_id" | "phone">

export type UserRole = "customer" | "active_driver" | "admin" | "in_active_driver"

export type Gender = "male" | "female" | "no_info" | ""

export type UserLoginRes = UserRes & { token: string }

export type changeUserStatusParams = Pick<IUser, "is_online"> & { user_id: string }

export type BlockUserStatus = "block" | "unblock"
export type BlockOrUnBlockUserParams = {
  user_id: string
  partner_id: string
  status: BlockUserStatus
}

export type getUserBlockListParams = Pick<IUser, "blocked_user_ids"> & QueryCommonParams

export interface LoginParams {
  phone: string
  password: string
}

export type RegisterParams = Pick<IUser, "user_id" | "phone" | "password" | "role"> & {
  confirm_password: string
}

export interface CreatePasswordParams {
  new_password: string
  confirm_new_password: string
}

export interface ChangePasswordParams extends CreatePasswordParams {
  current_password: string
}

export type CreatePasswordServiceParams = CreatePasswordParams & {
  _id: string
}

export type ChangePasswordServiceParams = ChangePasswordParams & {
  _id: string
}
