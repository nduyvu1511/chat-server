import { ObjectId } from "mongodb"

export interface IAttachment {
  _id: ObjectId
  url: string
  thumbnail_url?: string
  attachment_type: AttachmentType
  resource_ids: string[]
  created_at: Date
  updated_at: Date
}

export interface UploadSingleVideo {
  file: Express.Multer.File
  folder: string
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
 *          summary: Lower image quality used to render a small image
 *        url:
 *          type: string
 *          summary: Higher image quality used to render a big image
 *        attachment_type:
 *          type: string
 *          enum: [image, video]
 */
export type AttachmentRes = Pick<IAttachment, "url" | "attachment_type"> & {
  attachment_id: ObjectId
  thumbnail_url: string | null
}

export type CreateAttachment = Pick<IAttachment, "attachment_type" | "url" | "thumbnail_url"> & {
  desc?: string
}

export type UpdateAttachment = Partial<
  Pick<IAttachment, "attachment_type" | "url" | "thumbnail_url" | "updated_at">
> & {
  attachment_id: ObjectId
}

export interface SaveImage {
  thumbnail_url: string
  url: string
  resource_ids: string[]
}

export interface DeleteResource {
  resource_ids: string[]
  resource_type: "video" | "image"
}
