import Express from "express"
import MessageService from "../services/messageService"
import { IMessage, IUser, SendMessage } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"
import { toMessageResponse } from "../utils/messageResponse"

class MessageController {
  async sendMessage(req: Express.Request, res: Express.Response) {
    try {
      const params: SendMessage = req.body
      const user: IUser = req.locals
      const room = await MessageService.getRoomById(params.room_id)
      if (!room) return res.json(new ResponseError("Can not send a message because room not found"))

      const message: IMessage = await MessageService.sendMessage({ message: params, user })
      return res.json(
        new ResponseData(
          toMessageResponse({
            ...message,
            is_author: true,
            is_liked: false,
            reply_to: undefined,
            user_id: user,
          })
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new MessageController()
