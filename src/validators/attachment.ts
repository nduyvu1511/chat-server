import Joi from "joi"
import { URL_REGEX } from "../constant"
import { CreateAttachment } from "../types"

export const createAttachment = Joi.object<CreateAttachment>({
  attachment_type: Joi.string().valid("image", "video", "voice").required(),
  desc: Joi.string().optional(),
  thumbnail_url: Joi.string().regex(URL_REGEX).required(),
  url: Joi.string().regex(URL_REGEX).required(),
})
