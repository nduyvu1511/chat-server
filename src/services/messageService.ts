import { ObjectId } from "mongodb"
import Message from "../models/message"
import Room from "../models/room"
import { IMessage, MessagePopulate, SendMessageServiceParams } from "../types"
import { toLastMessageResponse } from "../utils/messageResponse"

export class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage> {
    const { message, user } = params
    const msg = new Message({ ...message, user_id: user._id })
    await msg.save()
    const messageRes: IMessage = (msg as any)._doc

    await this.appendLastMessageToRoomChat({
      ...messageRes,
      user_id: user,
      is_author: true,
      is_liked: false,
      reply_to: undefined,
    })
    return messageRes
  }

  async getRoomById(room_id: ObjectId) {
    return await Room.findById(room_id)
  }

  async appendLastMessageToRoomChat(params: MessagePopulate) {
    const lastMessage = toLastMessageResponse(params)
    return await Room.findByIdAndUpdate(params.room_id, {
      last_message: lastMessage,
    })
  }
}

export default new MessageService()
