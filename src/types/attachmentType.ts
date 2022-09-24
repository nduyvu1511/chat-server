import { ObjectId } from "mongodb"
import { UploadResourceRes } from "../services"

export interface IAttachment {
  _id: ObjectId
  url: string
  thumbnail_url?: string
  attachment_type: AttachmentType
  public_id: string
  asset_id: string
  created_at: Date
  updated_at: Date
}

export interface UploadSingleVideo {
  file: Express.Multer.File
  folder: string
  widthThumbnail?: number
  heightThumbnail?: number
}

export interface UploadMultipleVideo {
  files: Express.Multer.File[]
  folder: string
}

export interface UploadSingleImage extends UploadSingleVideo {
  widthThumbnail?: number
  heightThumbnail?: number
}

export interface UploadMultipleImage extends UploadMultipleVideo {
  widthThumbnail?: number
  heightThumbnail?: number
}

type AttachmentType = "image" | "video"

/**
 * @openapi
 * components:
 *  schema:
 *    AttachmentRes:
 *      type: object
 *      required:
 *        - attachment_id
 *        - thumbnail_url
 *        - url
 *        - attachment_type
 *      properties:
 *        attachment_id:
 *          type: string
 *        thumbnail_url:
 *          type: string
 *          summary: Hình ảnh chất lượng thấp hơn, nhẹ hơn khi render
 *        url:
 *          type: string
 *          summary:  Hình ảnh, video có chất lượng gốc
 *        attachment_type:
 *          type: string
 *          enum: [image, video]
 */

/**
 * @openapi
 * components:
 *  schema:
 *    AttachmentListRes:
 *      type: array
 *      items:
 *        $ref: '#components/schema/AttachmentRes'
 */

export type AttachmentRes = Pick<IAttachment, "url" | "attachment_type"> & {
  attachment_id: ObjectId
  thumbnail_url: string | null
}

export type CreateAttachment = UploadResourceRes & Pick<IAttachment, "attachment_type">

export type UpdateAttachment = Partial<
  Pick<IAttachment, "attachment_type" | "url" | "thumbnail_url" | "updated_at">
> & {
  attachment_id: ObjectId
}

export interface SaveImage {
  thumbnail_url: string
  url: string
  public_id: string
}

export interface DeleteResource {
  public_id: string
  resource_type: "video" | "image"
}
