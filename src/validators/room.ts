import Joi from "joi"
// import Jois from "joi-objectid"
import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { OBJECT_ID_REGEX } from "../constant"
import {
  AddMessageUnread,
  ClearMessageUnread,
  CreateGroupChat,
  createSingleChat,
  IMessage,
  IUser,
  QueryCommonParams,
  QueryRoomParams
} from "../types"

export const createSingleChatSchema = Joi.object<createSingleChat>({
  partner_id: Joi.number().required(),
})

export const createGroupChatSchema = Joi.object<CreateGroupChat>({
  member_ids: Joi.array().items(Joi.number()).required().min(1),
  room_avatar_id: Joi.string().regex(OBJECT_ID_REGEX).optional(),
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

export const addMessageUnReadSchema = Joi.object<AddMessageUnread>({
  message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export const clearMessageUnReadSchema = Joi.object<ClearMessageUnread>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export interface GetMessagesByFilter extends QueryCommonParams {
  current_user: IUser
  filter: FilterQuery<IMessage>
}
