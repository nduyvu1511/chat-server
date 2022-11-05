export const DEFAULT_MESSAGE = "Congratulation"
export const MESSAGES_LIMIT = 30
export const ROOMS_LIMIT = 30
export const USERS_LIMIT = 30
export const TAGS_LIMIT = 30

export const SELECT_USER = [
  "_id",
  "phone",
  "avatar",
  "gender",
  "bio",
  "role",
  "user_name",
  "date_of_birth",
  "is_online",
  "updated_at",
  "created_at",
  "offline_at",
  "socket_id",
]

export const SELECT_ROOM = [
  "_id",
  "room_name",
  "compounding_car_id",
  "room_avatar",
  "room_type",
  "member_ids",
  "leader_id",
  "last_message_id",
  "is_expired",
  "members_leaved",
  "created_at",
  "updated_at",
]

export const ACCESS_TOKEN_EXPIRED = "1d"
export const REFRESH_TOKEN_EXPIRED = "30d"
export const REFRESH_TOKEN_EXPIRED_NUMBER = "7d"
// 60 * 60 * 24 * 30
