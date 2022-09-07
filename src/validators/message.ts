import Joi from "joi"
import { SendMessage } from "../types"
import { LngLatSchema } from "./common"

export const SendMessageSchema = Joi.object<SendMessage>({
  text: Joi.string().required(),
  room_id: Joi.string().required(),
  location: LngLatSchema.optional(),
  attachment_ids: Joi.array().items(Joi.string()).optional(),
  reply_to: Joi.object({
    user_id: Joi.string().required(),
    message_id: Joi.string().required(),
    attachment_id: Joi.string().optional(),
  }).optional(),
  tag_ids: Joi.array().items(Joi.string().required()).optional(),
})
