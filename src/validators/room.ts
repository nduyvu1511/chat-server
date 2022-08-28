import Joi from "joi"
import { CreateGroupChatParams, CreateRoomChatParams, QueryRoomParams } from "../types"

export const createPrivateChatSchema = Joi.object<CreateRoomChatParams>({
  partner_id: Joi.string().required(),
})

export const createGroupChatSchema = Joi.object<CreateGroupChatParams>({
  member_ids: Joi.array().items(Joi.string()).required().min(1),
  room_avatar: Joi.string().valid("").optional(),
  room_name: Joi.string().valid("").optional(),
})

export const getRoomListSchema = Joi.object<QueryRoomParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
  search_term: Joi.string().optional().valid(""),
})
