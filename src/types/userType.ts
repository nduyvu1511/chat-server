export type CreateUserParams = Pick<
  IUser,
  "avatar" | "user_name" | "date_of_birth" | "gender" | "role" | "bio" | "phone"
>

export type UserRole = "customer" | "active_driver" | "admin" | "in_active_driver"
export type Gender = "male" | "female" | "no_info"

export interface IUser {
  _id: number
  user_id: number
  user_name: string
  role: UserRole
  avatar?: {
    _id: string
    url: string
  }
  bio?: string
  phone: string
  date_of_birth?: string
  blocked_user_ids: number[]
  gender?: Gender
  group_joined_ids: string[]
  messages_unread: {
    message_id: string
    group_id: string
  }
  message_unread_count: number
  created_at: number
  updated_at: number
  is_online: boolean
  offline_at: number
  group_blocked_noti_ids: string[]
}
