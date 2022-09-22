import { ObjectId } from "mongodb"
import log from "../config/logger"
import Attachment from "../models/attachment"
import { CreateAttachment, IAttachment, UpdateAttachment } from "../types"
import { UploadApiResponse, UploadImageRes } from "./uploadService"

export class AttachmentService {
  async updateAttachment(params: UpdateAttachment): Promise<IAttachment | null> {
    const { attachment_id, ...rest } = params
    return await Attachment.findByIdAndUpdate(attachment_id, rest, { new: true }).lean()
  }

  async createAttachment(params: CreateAttachment): Promise<IAttachment> {
    const data = new Attachment({
      attachment_type: "image",
      url: params.url,
      thumbnail_url: params.thumbnail_url,
      desc: params?.desc || "",
    })
    return (await data.save()).toObject()
  }

  async deleteAttachment(attachment_id: ObjectId): Promise<boolean> {
    try {
      await Attachment.findByIdAndDelete(attachment_id)
      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async saveImage(params: UploadImageRes): Promise<IAttachment> {
    const attachment = new Attachment({
      resource_ids: [params.original.public_id, params.thumbnail.public_id],
      thumbnail_url: params.thumbnail.secure_url,
      url: params.original.secure_url,
      attachment_type: "image",
    })

    return (await attachment.save()).toObject()
  }

  async saveMultipleImage(params: UploadImageRes[]): Promise<IAttachment[]> {
    try {
      const attachments = await Promise.all(
        params.map(async (item) => {
          return await this.saveImage(item)
        })
      )

      return attachments
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async saveVideo(params: UploadApiResponse): Promise<IAttachment> {
    try {
      const attachment = new Attachment({
        resource_ids: [params.public_id],
        url: params.secure_url,
        attachment_type: "video",
      })

      return (await attachment.save()).toObject()
    } catch (error) {
      log.error(error)
      return null as any
    }
  }

  async saveMultipleVideo(params: UploadApiResponse[]): Promise<IAttachment[]> {
    try {
      const attachments = await Promise.all(
        params.map(async (item) => {
          return await this.saveVideo(item)
        })
      )

      return attachments
    } catch (error) {
      log.error(error)
      return null as any
    }
  }
}

export default new AttachmentService()
