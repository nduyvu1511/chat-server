import { QueryCommonParams } from "./commonType"

export type CreateUserParams = Pick<
  IUser,
  "avatar" | "user_name" | "date_of_birth" | "gender" | "role" | "bio" | "phone" | "user_id"
> & { user_id: string }

export type UpdateProfileParams = Partial<
  Pick<IUser, "avatar" | "user_name" | "date_of_birth" | "gender" | "bio"> & { user_id: string }
>

export type GetTokenParams = Pick<IUser, "user_id" | "phone">

export type UserRole = "customer" | "active_driver" | "admin" | "in_active_driver"

export type Gender = "male" | "female" | "no_info"

export type UserRes = Pick<
  IUser,
  | "_id"
  | "avatar"
  | "bio"
  | "created_at"
  | "date_of_birth"
  | "gender"
  | "is_online"
  | "role"
  | "phone"
  | "user_name"
  | "updated_at"
> & { user_id: number }

export type UserLoginRes = UserRes & { token: string }

export type changeUserStatusParams = Pick<IUser, "is_online"> & { user_id: string }

export type BlockUserStatus = "block" | "unblock"
export type BlockOrUnBlockUserParams = {
  user_id: string
  partner_id: string
  status: BlockUserStatus
}

export type getUserBlockListParams = Pick<IUser, "blocked_user_ids"> & QueryCommonParams

export interface IUser {
  _id: string
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
    message_id: string
    room_id: string
  }
  message_unread_count: number
  created_at: number
  updated_at: number
  is_online: boolean
  offline_at: number
  room_blocked_noti_ids: string[]
}

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

export type PartnerRes = Pick<
  IUser,
  "avatar" | "bio" | "gender" | "date_of_birth" | "phone" | "user_name" | "is_online" | "offline_at"
> & {
  user_id: string
}
