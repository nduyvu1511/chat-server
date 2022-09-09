import Express from "express"
import { ObjectId } from "mongodb"
import Attachment from "../models/attachment"
import Tag from "../models/tag"
import MessageService from "../services/messageService"
import { IMessage, ITag, IUser, SendMessage } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class MessageController {
  async sendMessage(req: Express.Request, res: Express.Response) {
    try {
      const params: SendMessage = req.body
      const user: IUser = req.locals
      const room = await MessageService.getRoomById(params.room_id)
      if (!room) return res.json(new ResponseError("Can not send a message because room not found"))

      let tag_ids: ObjectId[] = []
      if (params?.tag_ids?.length) {
        const tagsRes = await MessageService.getTags(params.tag_ids)
        tag_ids = tagsRes?.map((item) => item._id)
      }

      let attachment_ids: ObjectId[] = []
      if (params?.attachment_ids?.length) {
        const attachmentsRes = await MessageService.getAttachments(params.attachment_ids)
        attachment_ids = attachmentsRes?.map((item) => item._id)
      }

      if (params.reply_to?.message_id) {
        const message = await MessageService.getMessage(params.reply_to.message_id)
        if (!message)
          return res.json(new ResponseError("Reply message not found, Reply message ID is invalid"))
      }

      const message: IMessage = await MessageService.sendMessage({
        message: { ...params, tag_ids, attachment_ids },
        user,
        room_id: room._id,
      })

      const messageRes = await MessageService.queryMessageRes({
        message_id: message._id,
        current_user: req.locals,
      })

      return res.json(new ResponseData(messageRes))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getTags(tag_ids: string[]): Promise<ITag[]> {
    return await Tag.find({
      _id: {
        $in: tag_ids,
      },
    }).lean()
  }

  async getAttachments(attachment_ids: string[]): Promise<ITag[]> {
    return await Attachment.find({
      _id: {
        $in: attachment_ids,
      },
    }).lean()
  }
}

export default new MessageController()
