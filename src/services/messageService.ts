import { ObjectId } from "mongodb"
import { SELECT_USER } from "../constant"
import Attachment from "../models/attachment"
import Message from "../models/message"
import Room from "../models/room"
import Tag from "../models/tag"
import {
  GetMessage,
  IAttachment,
  IMessage,
  IRoom,
  ITag,
  MessagePopulate,
  MessageRes,
  SendMessageServiceParams,
  UserReadLastMessage,
  UserReadMessage,
} from "../types"
import { toMessageResponse } from "../utils"

interface appendLastMessageIdToRoomParams {
  room_id: ObjectId
  message_id: ObjectId
}

class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage> {
    const { message, user } = params
    const msg = new Message({ ...message, user_id: user._id, read_by_user_ids: [user._id] })
    const msgRes: IMessage = (await msg.save()).toObject()

    await this.appendLastMessageIdToRoom({
      message_id: msg._id,
      room_id: params.room_id,
    })
    await this.pushMessageIdToRoom({ message_id: msg._id, room_id: params.room_id })
    return msgRes
  }

  async getMessageById(id: ObjectId): Promise<IMessage | null> {
    return await Message.findById(id).lean()
  }

  async getMessageRes({ current_user, message_id }: GetMessage): Promise<MessageRes | null> {
    const message: MessagePopulate | null = await Message.findById(message_id)
      .populate({
        path: "user_id",
        model: "User",
        select: SELECT_USER,
        populate: {
          path: "avatar_id",
          model: "Attachment",
        },
      })
      .populate({
        path: "reply_to.message_id",
        populate: {
          path: "user_id",
          model: "User",
          select: SELECT_USER,
          populate: {
            path: "avatar_id",
            model: "Attachment",
          },
        },
      })
      .populate("reply_to.attachment_id")
      .populate("tag_ids")
      .populate("attachment_ids")
      .lean()

    if (!message) return null

    return toMessageResponse({ data: message, current_user })
  }

  async pushMessageIdToRoom({ room_id, message_id }: appendLastMessageIdToRoomParams) {
    return await Room.findByIdAndUpdate(room_id, {
      $addToSet: {
        message_ids: message_id,
      },
    })
  }

  async getTags(tag_ids: ObjectId[]): Promise<ITag[]> {
    return await Tag.find({
      _id: {
        $in: tag_ids,
      },
    }).lean()
  }

  async getAttachments(attachment_ids: ObjectId[]): Promise<IAttachment[]> {
    return await Attachment.find({
      _id: {
        $in: attachment_ids,
      },
    }).lean()
  }

  async getRoomById(room_id: ObjectId): Promise<IRoom | null> {
    return await Room.findById(room_id)
  }

  async appendLastMessageIdToRoom({ room_id, message_id }: appendLastMessageIdToRoomParams) {
    return await Room.findByIdAndUpdate(room_id, {
      last_message_id: message_id,
    })
  }

  async confirmReadMessage({ user_id, message_id }: UserReadMessage): Promise<null | IMessage> {
    return await Message.findByIdAndUpdate(message_id, {
      $addToSet: {
        read_by_user_ids: user_id,
      },
    })
  }

  async confirmReadAllMessageInRoom({ user_id, room_id }: UserReadLastMessage): Promise<boolean> {
    await Message.updateMany(
      { $and: [{ room_id, read_by_user_ids: { $nin: [user_id] } }] },
      {
        ["$addToSet" as any]: {
          read_by_user_ids: user_id,
        },
      }
    )
    return true
  }

  // async getUsersReadMessage(user_ids: ObjectId[]) {
  //   const users = await User.find({
  //     _id: {
  //       $in: user_ids,
  //     },
  //   }).lean()
  // }
}

export default new MessageService()
