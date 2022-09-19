export const DEFAULT_MESSAGE = "Congratulation"
export const MESSAGES_LIMIT = 30
export const ROOMS_LIMIT = 30
export const USERS_LIMIT = 30
export const TAGS_LIMIT = 30

export const SELECT_USER = [
  "_id",
  "phone",
  "avatar_id",
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
  "room_avatar_id",
  "room_single_member_ids",
  "room_type",
  "member_ids",
  "leader_id",
  "last_message_id",
  "pinned_message_ids",
  "is_expired",
  "members_leaved",
  "created_at",
  "updated_at",
]

export const ACCESS_TOKEN_EXPIRED = "1d"
export const REFRESH_TOKEN_EXPIRED = "30d"
export const REFRESH_TOKEN_EXPIRED_NUMBER = 60 * 60 * 24 * 30
