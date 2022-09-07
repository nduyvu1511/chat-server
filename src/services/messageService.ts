import { ObjectId } from "mongodb"
import Message from "../models/message"
import Room from "../models/room"
import { IMessage, SendMessageServiceParams } from "../types"
import { toLastMessageResponse } from "../utils/messageResponse"

export class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage> {
    const { message, user } = params
    const messageRes = new Message({ ...message, user_id: user._id })
    await messageRes.save()
    const messageRess: IMessage = (messageRes as any)._doc
    await this.appendLastMessageToRoomChat({
      message: messageRess,
      room_id: message.room_id,
    })
    return messageRess
  }

  async getRoomById(room_id: ObjectId) {
    return await Room.findById(room_id)
  }

  async appendLastMessageToRoomChat({
    room_id,
    message,
  }: {
    room_id: ObjectId
    message: IMessage
  }) {
    const lastMessage = toLastMessageResponse(message)
    return await Room.findByIdAndUpdate(room_id, {
      last_message: lastMessage,
    })
  }
}

export default new MessageService()
