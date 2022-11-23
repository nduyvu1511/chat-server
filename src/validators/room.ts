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
  QueryRoomParams,
  UpdateRoomInfo,
} from "../types"

/**
 * @openapi
 * components:
 *  schema:
 *    CreateSingleChat:
 *      type: object
 *      required:
 *        - partner_id
 *      properties:
 *        partner_id:
 *          type: number
 *        compounding_car_id:
 *          type: number
 */
export const createSingleChatSchema = Joi.object<createSingleChat>({
  partner_id: Joi.alternatives().try(Joi.number(), Joi.string().regex(OBJECT_ID_REGEX)).required(),
  compounding_car_id: Joi.number().required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    CreateGroupChat:
 *      type: object
 *      required:
 *        - member_ids
 *        - room_name
 *      properties:
 *        member_ids:
 *          type: array
 *          items:
 *            type: number
 *            summary: Lấy id này từ partner_id của server Exxe, Phải có ít nhất 3 người thì mới tạo được nhóm chat
 *            example: [1,2,3]
 *        room_avatar:
 *          type: string
 *          example: 631a99cc79c11fc36845e297
 *          summary: Lấy từ url của hình ảnh của loại chuyến đi hoặc hình của tỉnh đến
 *        room_name:
 *          type: string
 *        compounding_car_id:
 *          type: string
 */
export const createGroupChatSchema = Joi.object<CreateGroupChat>({
  member_ids: Joi.array().items(Joi.number()).required().min(1),
  room_avatar: Joi.string().optional(),
  room_name: Joi.string().required(),
  compounding_car_id: Joi.number().required(),
})

export const listSchema = Joi.object<QueryCommonParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
})

export const addMessagePinnedSchema = Joi.object({
  message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    QueryList:
 *      type: object
 *      properties:
 *        limit:
 *          type: number
 *        offset:
 *          type: number
 */

/**
 * @openapi
 * components:
 *  schema:
 *    GetRoomList:
 *      type: object
 *      properties:
 *        limit:
 *          type: number
 *        offset:
 *          type: number
 *        search_term:
 *          type: string
 *          summary: Tìm kiếm nhóm chat theo tên
 */
export const getRoomListSchema = Joi.object<QueryRoomParams>({
  limit: Joi.number().optional(),
  offset: Joi.number().optional(),
  search_term: Joi.string().optional().allow("", null),
  room_type: Joi.string().optional().allow("", null),
})

export const roomIdSchema = Joi.object<{ room_id: ObjectId }>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export const compoundingCarIdSchema = Joi.object<{ compounding_car_id: ObjectId }>({
  compounding_car_id: Joi.number().required(),
})

export const addMemberToRoomSchema = Joi.object<{ user_id: ObjectId | number; room_id: ObjectId }>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  user_id: Joi.alternatives().try(Joi.number(), Joi.string().regex(OBJECT_ID_REGEX)).required(),
})

export const deleteMemberFromRoomSchema = Joi.object<{
  user_id: ObjectId | number
  room_id: ObjectId
}>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  user_id: Joi.alternatives().try(Joi.number(), Joi.string().regex(OBJECT_ID_REGEX)).required(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    UpdateRoomInfo:
 *      type: object
 *      properties:
 *        room_avatar:
 *          type: string
 *          example: 631a99cc79c11fc36845e297
 *          summary: Lấy từ url của Server Exxe
 *        room_name:
 *          type: string
 */
export const updateRoomSchema = Joi.object<UpdateRoomInfo>({
  room_name: Joi.string().optional(),
  room_avatar: Joi.string().optional(),
})

/**
 * @openapi
 * components:
 *  schema:
 *    MessageId:
 *      type: object
 *      required:
 *        - message_id
 *      properties:
 *        message_id:
 *          type: string
 *          example: 631a99cc79c11fc36845e297
 */

/**
 * @openapi
 * components:
 *  schema:
 *    RoomId:
 *      type: object
 *      required:
 *        - room_id
 *      properties:
 *        room_id:
 *          type: string
 *          example: 631a99cc79c11fc36845e297
 */
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
