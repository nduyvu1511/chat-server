import { ObjectId } from "mongodb"
import log from "../config/logger"
import { SELECT_USER, USERS_LIMIT } from "../constant"
import Message from "../models/message"
import Room from "../models/room"
import Tag from "../models/tag"
import {
  GetMessage,
  GetUsersLikedMessage,
  IMessage,
  IRoom,
  ITag,
  LikeMessageService,
  ListRes,
  MessagePopulate,
  MessageRes,
  SendMessageServiceParams,
  UnlikeMessageService,
  UserLikedMessageRes,
  UserReadLastMessage,
  UserReadMessage,
} from "../types"
import { toListResponse, toMessageResponse } from "../utils"

interface appendLastMessageIdToRoomParams {
  room_id: ObjectId
  message_id: ObjectId
}

class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage | null> {
    try {
      const { message, user } = params
      const msg = new Message({ ...message, user_id: user._id, read_by_user_ids: [user._id] })
      const msgRes: IMessage = (await msg.save()).toObject()

      await this.appendLastMessageIdToRoom({
        message_id: msg._id,
        room_id: params.room_id,
      })
      await this.pushMessageIdToRoom({ message_id: msg._id, room_id: params.room_id })
      return msgRes
    } catch (error) {
      log.error(error)
      return null
    }
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
    try {
      return await Room.findByIdAndUpdate(room_id, {
        $addToSet: {
          message_ids: message_id,
        },
      })
    } catch (error) {
      log.error(error)
    }
  }

  async getTags(tag_ids: ObjectId[]): Promise<ITag[]> {
    return await Tag.find({
      _id: {
        $in: tag_ids,
      },
    }).lean()
  }

  async getRoomById(room_id: ObjectId): Promise<IRoom | null> {
    return await Room.findById(room_id)
  }

  async appendLastMessageIdToRoom({ room_id, message_id }: appendLastMessageIdToRoomParams) {
    try {
      return await Room.findByIdAndUpdate(room_id, {
        last_message_id: message_id,
      })
    } catch (error) {
      log.error(error)
    }
  }

  async confirmReadMessage({ user_id, message_id }: UserReadMessage): Promise<null | IMessage> {
    try {
      return await Message.findByIdAndUpdate(message_id, {
        $addToSet: {
          read_by_user_ids: user_id,
        },
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async confirmReadAllMessageInRoom({ user_id, room_id }: UserReadLastMessage): Promise<boolean> {
    try {
      await Message.updateMany(
        { $and: [{ room_id, read_by_user_ids: { $nin: [user_id] } }] },
        {
          ["$addToSet" as any]: {
            read_by_user_ids: user_id,
          },
        }
      )
      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async likeMessage({
    emotion,
    message_id,
    user_id,
  }: LikeMessageService): Promise<IMessage | null> {
    try {
      return await Message.findByIdAndUpdate(message_id, {
        $addToSet: {
          liked_by_user_ids: {
            user_id: user_id as any,
            emotion,
          },
        },
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async unlikeMessage({ message_id, user_id }: UnlikeMessageService): Promise<IMessage | null> {
    try {
      return await Message.findByIdAndUpdate(message_id, {
        $pull: {
          liked_by_user_ids: {
            user_id,
          },
        },
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async getUsersLikedMessage(
    params: GetUsersLikedMessage
  ): Promise<ListRes<UserLikedMessageRes[]>> {
    const { limit = USERS_LIMIT, offset = 0, message_id } = params
    try {
      const total: any = await Message.aggregate([
        {
          $match: {
            _id: new ObjectId(message_id),
          },
        },
        {
          $unwind: "$liked_by_user_ids",
        },
        {
          $count: "total",
        },
      ])

      const userList: UserLikedMessageRes[] = await Message.aggregate([
        {
          $match: {
            _id: new ObjectId(message_id),
          },
        },
        {
          $unwind: "$liked_by_user_ids",
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$$ROOT", "$liked_by_user_ids"],
            },
          },
        },
        {
          $project: {
            _id: 0,
            emotion: 1,
            user_id: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_id",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  user_id: "$_id",
                  phone: 1,
                  bio: 1,
                  date_of_birth: 1,
                  user_name: 1,
                  gender: 1,
                  role: 1,
                  offline_at: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user_id",
        },
        {
          $group: {
            _id: "$emotion",
            data: {
              $push: "$user_id",
            },
          },
        },
        {
          $project: {
            _id: 1,
            data: 1,
          },
        },
      ])

      const data = [{ _id: "all", data: [[...userList].map((item) => item.data)] }, ...userList]

      return toListResponse({
        data,
        limit,
        offset,
        total: total?.[0]?.total || 0,
      })
    } catch (error) {
      log.error(error)
      return {
        data: [],
        limit,
        hasMore: false,
        offset,
        total: 0,
      }
    }
  }
}

export default new MessageService()
