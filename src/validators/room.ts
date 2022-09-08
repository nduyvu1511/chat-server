import Joi from "joi"
// import Jois from "joi-objectid"
import { ObjectId } from "mongodb"
import { OBJECT_ID_REGEX } from "../constant"
import { CreateGroupChat, CreatePrivateChat, QueryCommonParams, QueryRoomParams } from "../types"

export const createPrivateChatSchema = Joi.object<CreatePrivateChat>({
  partner_id: Joi.number().required(),
})

export const createGroupChatSchema = Joi.object<CreateGroupChat>({
  member_ids: Joi.array().items(Joi.number()).required().min(1),
  room_avatar: Joi.string().optional(),
  room_name: Joi.string().required(),
})

export const listSchema = Joi.object<QueryCommonParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
})

export const getRoomListSchema = Joi.object<QueryRoomParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
  search_term: Joi.string().optional(),
})

export const roomIdSchema = Joi.object<{ room_id: ObjectId }>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})
