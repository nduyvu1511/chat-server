import { ObjectId } from "mongodb"
import log from "../config/logger"
import Attachment from "../models/attachment"
import { CreateAttachment, IAttachment, UpdateAttachment } from "../types"

export class AttachmentService {
  async updateAttachment(params: UpdateAttachment): Promise<IAttachment | null> {
    try {
      const { attachment_id, ...rest } = params
      return await Attachment.findByIdAndUpdate(attachment_id, rest, { new: true }).lean()
    } catch (error) {
      log.error(error)
      return null
    }
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

  async createMultipleAttachment(params: CreateAttachment[]): Promise<IAttachment[]> {
    try {
      const attachments = await Promise.all(
        params.map(async (item) => {
          return await this.createAttachment(item)
        })
      )

      return attachments
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async getAttachments(attachment_ids: ObjectId[]): Promise<IAttachment[]> {
    return await Attachment.find({
      _id: {
        $in: attachment_ids,
      },
    }).lean()
  }

  async createAttachment(params: CreateAttachment): Promise<IAttachment> {
    try {
      const attachment = new Attachment({
        public_id: params.public_id,
        asset_id: params.asset_id,
        url: params.url,
        attachment_type: params.attachment_type,
        thumbnail_url: params.thumbnail_url,
      })

      return (await attachment.save()).toObject()
    } catch (error) {
      log.error(error)
      return null as any
    }
  }

  async getAttachmentById(attachment_id: ObjectId): Promise<IAttachment | null> {
    try {
      return await Attachment.findById(attachment_id).lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }
}

export default new AttachmentService()
