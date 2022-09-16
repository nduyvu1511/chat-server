import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { AttachmentRes, IAttachment, QueryCommonParams } from "./commonType"

export interface IUser {
  _id: ObjectId
  user_name: string
  role: UserRole
  avatar_id?: ObjectId
  password: string
  bio?: string
  phone: string
  user_id: number
  date_of_birth?: string
  blocked_user_ids: number[]
  gender?: Gender
  user_chatted_with_ids: ObjectId[]
  room_joined_ids: string[]
  message_unread_count: number
  created_at: Date
  updated_at: Date
  is_online: boolean
  offline_at: Date
  room_blocked_noti_ids: string[]
  socket_id: string
}

export type UserPopulate = Omit<IUser, "avatar_id"> & {
  avatar_id: IAttachment
}

export type UserRes = Pick<
  IUser,
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
  avatar: AttachmentRes
}

export type UserData = UserRes & {
  user_chatted_with_ids: string[]
  room_joined_ids: string[]
  room_blocked_noti_ids: string[]
}

export type CreateUserParams = Pick<
  IUser,
  "user_name" | "date_of_birth" | "gender" | "role" | "bio" | "phone" | "user_id"
> & {
  user_id: string
  avatar: string
}

export type UpdateProfile = Partial<
  Pick<IUser, "user_name" | "date_of_birth" | "gender" | "bio"> & {
    avatar: string
  }
>

export type UpdateProfileService = UpdateProfile & { user: IUser }

export type GetTokenParams = Pick<IUser, "user_id" | "phone">

export type UserRole = "customer" | "driver" | "admin"

export type Gender = "male" | "female" | "no_info" | ""

export type UserLoginRes = UserRes & { token: string }

export type changeUserStatusParams = Pick<IUser, "is_online"> & {
  user_id: string
  socket_id: string
}

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

export interface LoginSocket {
  socket_id: string
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

export type GetUserByFilter = Partial<QueryCommonParams> & {
  filter: FilterQuery<IUser>
}

export interface ChangeUserStatusBySocketId {
  socket_id: string
  is_online: boolean
}

export interface AddUserSocketId {
  user_id: string
  socket_id: string
}

export interface AddUserIdsChattedWith {
  user_ids: ObjectId[]
}

export interface LoginToSocket {
  socket_id: string
  user_id: string
  // socket: Socket<any>
}

export interface UserSocketId {
  user_id: ObjectId
  socket_id: string
}
