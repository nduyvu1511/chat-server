import Attachment from "../models/attachment"
import { CreateAttachment, IAttachment, UpdateAttachment } from "../types"

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
}

export default new AttachmentService()
