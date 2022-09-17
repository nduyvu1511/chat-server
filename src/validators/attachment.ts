import Joi from "joi"
import { URL_REGEX } from "../constant"
import { CreateAttachment } from "../types"

/**
 * @openapi
 * components:
 *  schema:
 *    CreateAttachment:
 *      type: object
 *      required:
 *        - attachment_type
 *        - thumbnail_url
 *        - url
 *      properties:
 *        attachment_type:
 *          type: string
 *          enum: [image, video, voice]
 *          summary: loại của tệp tin
 *        desc:
 *          type: string
 *          summary: Mô tả tệp tin
 *        thumbnail_url:
 *          type: string
 *          summary: thumbnail URL của hình ảnh, kích thước nhỏ, chi tiết thấp
 *        url:
 *          type: string
 *          summary: URL của hình ảnh, chi tiết cao
 */
export const createAttachment = Joi.object<CreateAttachment>({
  attachment_type: Joi.string().valid("image", "video", "voice").required(),
  desc: Joi.string().optional(),
  thumbnail_url: Joi.string().regex(URL_REGEX).required(),
  url: Joi.string().regex(URL_REGEX).required(),
})
