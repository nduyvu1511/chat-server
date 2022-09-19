import Express from "express"
import { ObjectId } from "mongodb"
import { USERS_LIMIT } from "../constant"
import MessageService from "../services/messageService"
import UserService from "../services/userService"
import { IMessage, IUser, LikeMessageRes, UnlikeMessageRes, SendMessage } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class MessageController {
  async sendMessage(req: Express.Request, res: Express.Response) {
    try {
      const params: SendMessage = req.body
      const user: IUser = req.user
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
        const message = await MessageService.getMessageById(params.reply_to.message_id)
        if (!message || message.room_id.toString() !== room._id.toString())
          return res.json(new ResponseError("Reply message not found, Reply message ID is invalid"))
      }

      const message: IMessage = await MessageService.sendMessage({
        message: { ...params, tag_ids, attachment_ids },
        user,
        room_id: room._id,
      })

      const messageRes = await MessageService.getMessageRes({
        message_id: message._id,
        current_user: req.user,
      })

      return res.json(new ResponseData(messageRes))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getMessageById(req: Express.Request, res: Express.Response) {
    try {
      console.log(req.params)
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
      console.log(req.body)
      const message = await MessageService.likeMessage({ ...req.body, user_id: req.user._id })
      if (!message) return res.json(new ResponseError("Failed to like this message"))

      return res.json(
        new ResponseData<LikeMessageRes>(
          {
            message_id: message._id,
            emotion: req.body.emotion,
            user_id: req.user._id,
            room_id: message.room_id,
          },
          "liked message"
        )
      )
    } catch (error) {
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

      return res.json(
        new ResponseData<UnlikeMessageRes>(
          { message_id: data._id, room_id: data.room_id, user_id: req.user._id },
          "unliked message"
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUsersLikedMessage(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || USERS_LIMIT
      const offset = Number(req.query?.offset) || 0

      console.log(req.message.liked_by_user_ids)

      const data = await UserService.getUserListByFilter({
        filter: {
          _id: {
            $in: req.message?.liked_by_user_ids?.map((item) => item.user_id) || [],
          },
        },
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
