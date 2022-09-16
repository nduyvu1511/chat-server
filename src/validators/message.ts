import Joi from "joi"
import { OBJECT_ID_REGEX } from "../constant"
import { SendMessage, UserReadLastMessage, UserReadMessage } from "../types"
import { LngLatSchema } from "./common"

export const SendMessageSchema = Joi.object<SendMessage>({
  text: Joi.string()
    .required()
    .when("location", {
      then: Joi.string().optional(),
    })
    .when("attachment_ids", {
      then: Joi.string().optional(),
    })
    .when("tag_ids", {
      then: Joi.string().optional(),
    }),
  room_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
  location: LngLatSchema.optional(),
  attachment_ids: Joi.array().items(Joi.string().regex(OBJECT_ID_REGEX)).optional(),
  reply_to: Joi.object({
    message_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
    attachment_id: Joi.string().regex(OBJECT_ID_REGEX).optional(),
  }).optional(),
  tag_ids: Joi.array().items(Joi.string().regex(OBJECT_ID_REGEX).required()).optional(),
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
