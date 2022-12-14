import Joi from "joi"
import { OBJECT_ID_REGEX } from "../constant"
import { LikeMessage, SendMessage, UserReadLastMessage, UserReadMessage } from "../types"
import { LngLatSchema } from "./common"

/**
 * @openapi
 * components:
 *  schema:
 *    SendMessage:
 *      type: object
 *      required:
 *        - room_id
 *      properties:
 *        text:
 *          type: string
 *          summary: Là trường bắt buộc khi không có 1 trong cấc tham số location, attachment_ids
 *        room_id:
 *          type: string
 *        attachment_ids:
 *          type: array
 *          items:
 *            type: string
 *            summary: Lấy từ bảng Attachment
 *        reply_to:
 *          type: object
 *          properties:
 *            message_id:
 *              type: string
 *            attachment_id:
 *              type: string
 *              summary: Lấy từ bảng Attachment
 *          items:
 *            type: string
 *            summary: Lấy từ bảng Attachment
 */
export const sendMessageSchema = Joi.object<SendMessage>({
  text: Joi.string()
    .required()
    .when("location", {
      then: Joi.string().allow("").optional(),
    })
    .when("attachment_ids", {
      then: Joi.string().allow("").optional(),
    }),
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  location: LngLatSchema.optional(),
  attachment_ids: Joi.array().items(Joi.string().regex(OBJECT_ID_REGEX)).optional(),
  reply_to: Joi.object({
    message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
    attachment_id: Joi.string().regex(OBJECT_ID_REGEX).optional(),
  }).optional(),
})

export const readMessageSchema = Joi.object<UserReadMessage>({
  message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export const readLastMessageSchema = Joi.object<UserReadLastMessage>({
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export const messageIdSchema = Joi.object<{ message_id: string }>({
  message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

export const likeMessageSchema = Joi.object<LikeMessage>({
  message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  emotion: Joi.string().valid("like", "angry", "sad", "wow", "heart", "laugh").required(),
})
