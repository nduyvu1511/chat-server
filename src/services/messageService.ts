import { ObjectId } from "mongodb"
import Message from "../models/message"
import Room from "../models/room"
import { IMessage, SendMessageServiceParams } from "../types"

interface appendLastMessageIdToRoomParams {
  room_id: ObjectId
  message_id: ObjectId
}

export class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage> {
    const { message, user } = params
    const msg = new Message({ ...message, user_id: user._id })
    await msg.save()
    const messageRes: IMessage = (msg as any)._doc

    await this.appendLastMessageIdToRoom({
      message_id: msg._id,
      room_id: params.room_id,
    })
    await this.pushMessageIdToRoom({ message_id: msg._id, room_id: params.room_id })

    return messageRes
  }

  async pushMessageIdToRoom({ room_id, message_id }: appendLastMessageIdToRoomParams) {
    return await Room.findByIdAndUpdate(room_id, {
      $addToSet: {
        message_ids: message_id,
      },
    })
  }

  async getRoomById(room_id: ObjectId) {
    return await Room.findById(room_id)
  }

  async appendLastMessageIdToRoom({ room_id, message_id }: appendLastMessageIdToRoomParams) {
    return await Room.findByIdAndUpdate(room_id, {
      last_message_id: message_id,
    })
  }
}

export default new MessageService()
