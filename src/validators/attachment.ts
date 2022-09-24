import Joi, { string } from "joi"
import { OBJECT_ID_REGEX, URL_REGEX } from "../constant"
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
 *          enum: [image, video]
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
  attachment_type: Joi.string().valid("image", "video").required(),
  thumbnail_url: Joi.string().regex(URL_REGEX).required(),
  url: Joi.string().regex(URL_REGEX).required(),
})

export const attachmentIdSchema = Joi.object({
  attachment_id: Joi.string().regex(OBJECT_ID_REGEX).required(),
})

// export const deleteResourceSchema = Joi.object({
//   resource_type: Joi.string().valid("image", "video").required(),
// })
