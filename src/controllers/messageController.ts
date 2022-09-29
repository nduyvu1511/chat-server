import Express from "express"
import { ObjectId } from "mongodb"
import log from "../config/logger"
import { USERS_LIMIT } from "../constant"
import AttachmentService from "../services/attachmentService"
import MessageService from "../services/messageService"
import UserService from "../services/userService"
import { IUser, LikeMessageRes, SendMessage, UnlikeMessageRes } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class MessageController {
  async sendMessage(req: Express.Request, res: Express.Response) {
    try {
      if (req.room.is_deleted)
        return res.json(
          new ResponseError("Failed to send message because this room has been deleted")
        )

      const params: SendMessage = req.body
      const user: IUser = req.user

      if (
        !params.text &&
        !params.tag_ids?.length &&
        !params.location &&
        !params?.attachment_ids?.length
      )
        return res.json(new ResponseError("Can not send a message because missing fields"))

      let tag_ids: ObjectId[] = []
      if (params?.tag_ids?.length) {
        const tagsRes = await MessageService.getTags(params.tag_ids)
        tag_ids = tagsRes?.map((item) => item._id)
      }

      let attachment_ids: ObjectId[] = []
      if (params?.attachment_ids?.length) {
        const attachmentsRes = await AttachmentService.getAttachments(params.attachment_ids)
        attachment_ids = attachmentsRes?.map((item) => item._id)
      }

      if (params.reply_to?.message_id) {
        const message = await MessageService.getMessageById(params.reply_to.message_id)
        if (!message || message.room_id.toString() !== params.room_id.toString())
          return res.json(new ResponseError("Reply message not found, Reply message ID is invalid"))
      }

      if (params.reply_to?.attachment_id) {
        const attachment = await AttachmentService.getAttachmentById(params.reply_to.attachment_id)
        if (!attachment)
          return res.json(new ResponseError("Reply message with attachment not found"))
      }

      const message = await MessageService.sendMessage({
        message: { ...params, tag_ids, attachment_ids },
        user,
        room_id: params.room_id,
      })
      if (!message) return res.json(new ResponseError("Failed to send message"))

      const messageRes = await MessageService.getMessageRes({
        message_id: message._id,
        current_user: req.user,
      })

      return res.json(new ResponseData(messageRes))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async getMessageById(req: Express.Request, res: Express.Response) {
    try {
      const messageRes = await MessageService.getMessageRes({
        message_id: req.params.message_id as any,
        current_user: req.user,
      })
      if (!messageRes) return res.json(new ResponseError("Message not found"))

      return res.json(new ResponseData(messageRes))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async confirmReadMessage(req: Express.Request, res: Express.Response) {
    try {
      const message = await MessageService.confirmReadMessage({
        message_id: req.body.message_id,
        user_id: req.user._id,
      })
      if (!message) return res.json(new ResponseError("Failed to read message"))

      return res.json(new ResponseData({ message_id: message._id }, "Confirmed read message"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async confirmReadAllMessageInRoom(req: Express.Request, res: Express.Response) {
    try {
      const message = await MessageService.confirmReadAllMessageInRoom({
        room_id: req.body.room_id,
        user_id: req.user._id,
      })
      if (!message) return res.json(new ResponseError("Failed to read all messages in room"))

      return res.json(
        new ResponseData({ room_id: req.body.room_id }, "Confirmed read all messages in room")
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUsersReadMessage(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || USERS_LIMIT
      const offset = Number(req.query?.offset) || 0

      const users = await UserService.getUserListByFilter({
        filter: {
          $and: [
            {
              _id: {
                $in: req.message.read_by_user_ids,
              },
            },
            {
              _id: {
                $ne: req.user._id,
              },
            },
          ],
        },
        limit,
        offset,
      })

      return res.json(new ResponseData(users))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async likeMessage(req: Express.Request, res: Express.Response) {
    try {
      const message = await MessageService.likeMessage({
        emotion: req.body.emotion,
        message: req.message,
        user_id: req.user._id,
      })
      if (!message) return res.json(new ResponseError("Failed to like this message"))

      const messageRes = await MessageService.getMessageRes({
        current_user: req.user,
        message_id: req.message._id,
      })

      return res.json(new ResponseData(messageRes, "Reacted message"))
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async unlikeMessage(req: Express.Request, res: Express.Response) {
    try {
      const { message_id } = req.params
      const data = await MessageService.unlikeMessage({
        message_id: message_id as any,
        user_id: req.user._id,
      })
      if (!data) return res.json(new ResponseError("Failed to unlike this message"))

      const messageRes = await MessageService.getMessageRes({
        current_user: req.user,
        message_id: message_id as any,
      })

      return res.json(new ResponseData(messageRes, "Unreacted message"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUsersLikedMessage(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || USERS_LIMIT
      const offset = Number(req.query?.offset) || 0

      const data = await MessageService.getUsersLikedMessage({
        message_id: req.params.message_id as any,
        limit,
        offset,
      })

      return res.json(new ResponseData(data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new MessageController()
