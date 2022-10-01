import _ from "lodash"
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
  MessagePopulate,
  MessageRes,
  SendMessageServiceParams,
  UnlikeMessageService,
  UserLikedMessage,
  UserLikedMessageRes,
  UserReadLastMessage,
  UserReadMessage,
  UserRes,
} from "../types"
import { toMessageResponse } from "../utils"

interface appendLastMessageIdToRoomParams {
  room_id: ObjectId
  message_id: ObjectId
}

class MessageService {
  async sendMessage(params: SendMessageServiceParams): Promise<IMessage | null> {
    try {
      const { message, user } = params
      const msg = new Message({
        ...message,
        user_id: user._id,
        read_by_user_ids: [{ user_id: user._id }],
      })
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

  async getDetailMessage({ current_user, message_id }: GetMessage): Promise<MessageRes | null> {
    const message = await Message.aggregate([
      {
        $match: {
          _id: new ObjectId(new ObjectId(message_id)),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $lookup: {
                from: "attachments",
                localField: "avatar_id",
                foreignField: "_id",
                as: "avatar",
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      attachment_id: "$_id",
                      thumbnail_url: 1,
                      url: 1,
                      attachment_type: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$avatar",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ["$$ROOT", "$avatar"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                author_id: "$_id",
                author_name: "$user_name",
                author_avatar: "$avatar",
                is_online: "$is_online",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "attachments",
          localField: "attachment_ids",
          foreignField: "_id",
          as: "attachment_ids",
          pipeline: [
            {
              $project: {
                _id: 0,
                attachment_id: "$_id",
                url: "$url",
                thumnail_url: "$thumbnail_url",
                attachment_type: "$attachment_type",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          let: { ids: "$read_by_user_ids.user_id" },
          as: "read_by",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$ids"] },
                    {
                      $not: {
                        $eq: ["$_id", new ObjectId(current_user._id)],
                      },
                    },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "attachments",
                localField: "avatar_id",
                foreignField: "_id",
                as: "avatar_id",
                pipeline: [
                  {
                    $project: {
                      thumbnail_url: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$avatar_id",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                user_id: "$_id",
                user_name: "$user_name",
                user_avatar: { $ifNull: ["$avatar_id.thumbnail_url", null] },
                is_online: "$is_online",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "room",
          pipeline: [
            {
              $project: {
                _id: 0,
                member_ids: "$member_ids.user_id",
              },
            },
          ],
        },
      },
      {
        $unwind: "$room",
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$$ROOT", "$room"],
          },
        },
      },
      {
        $set: {
          member_ids: {
            $filter: {
              input: "$member_ids",
              as: "member_ids",
              cond: {
                $and: [
                  {
                    $not: {
                      $in: ["$$member_ids", "$read_by_user_ids.user_id"],
                    },
                  },
                  {
                    $not: {
                      $eq: ["$_id", new ObjectId(current_user._id)],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { ids: "$member_ids" },
          as: "un_read_by",
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
              },
            },
            {
              $lookup: {
                from: "attachments",
                localField: "avatar_id",
                foreignField: "_id",
                as: "avatar_id",
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      thumbnail_url: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$avatar_id",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                user_id: "$_id",
                user_name: "$user_name",
                user_avatar: { $ifNull: ["$avatar_id.thumbnail_url", null] },
                is_online: "$is_online",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "attachments",
          localField: "avatar_id",
          foreignField: "_id",
          as: "avatar",
          pipeline: [
            {
              $project: {
                _id: 0,
                thumbnail_url: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          message_id: "$_id",
          room_id: "$room_id",
          author: "$author",
          is_author: {
            $eq: ["$author.author_id", new ObjectId(current_user._id)],
          },
          attachments: "$attachment_ids",
          message_text: "$text",
          reply_to: "$reply_to",
          location: "$location",
          tags: "$tags",
          read_by: "$read_by",
          un_read_by: "$un_read_by",
        },
      },
    ])

    if (!message?.length) return null

    const messageRes = message[0]

    return {
      is_author: current_user._id.toString() === messageRes.author.author_id.toString(),
      ...messageRes,
    }
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
      return await Message.findOneAndUpdate(
        {
          $and: [
            {
              message_id: new ObjectId(message_id),
              "read_by_user_ids.user_id": { $nin: user_id },
            },
          ],
        },
        {
          $addToSet: {
            read_by_user_ids: { user_id: user_id as any },
          },
        }
      )
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async confirmReadAllMessageInRoom({ user_id, room_id }: UserReadLastMessage): Promise<boolean> {
    try {
      await Message.updateMany(
        {
          $and: [
            {
              room_id: new ObjectId(room_id),
              "read_by_user_ids.user_id": { $nin: [new ObjectId(user_id)] },
            },
          ],
        },
        {
          ["$addToSet" as any]: {
            read_by_user_ids: { user_id: new ObjectId(user_id) },
          },
        }
      )
      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async likeMessage({ emotion, message, user_id }: LikeMessageService): Promise<IMessage | null> {
    try {
      const { _id: message_id } = message

      const user = (message?.liked_by_user_ids || [])?.find(
        (item) => item.user_id.toString() === user_id.toString()
      )

      if (!user) {
        return await Message.findByIdAndUpdate(message_id, {
          $addToSet: {
            liked_by_user_ids: {
              user_id: user_id as any,
              emotion,
            },
          },
        })
      }

      if (user?.emotion === emotion) return null

      await this.unlikeMessage({ message_id, user_id })

      return await Message.findByIdAndUpdate(message_id, {
        $addToSet: {
          liked_by_user_ids: { user_id: user_id as any, emotion },
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

  async getUsersLikedMessage(params: GetUsersLikedMessage): Promise<UserLikedMessageRes> {
    const { limit = USERS_LIMIT, offset = 0, message_id } = params
    try {
      const userList: UserLikedMessage[] = await Message.aggregate([
        {
          $match: {
            _id: new ObjectId(message_id),
          },
        },
        {
          $unwind: "$liked_by_user_ids",
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
                $lookup: {
                  from: "attachments",
                  localField: "avatar_id",
                  foreignField: "_id",
                  as: "avatar_id",
                },
              },
              {
                $unwind: {
                  path: "$avatar_id",
                  preserveNullAndEmptyArrays: true,
                },
              },
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
                  avatar: {
                    $ifNull: ["$avatar_id.thumbnail_url", null],
                  },
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

      const newUserList = userList.map((item) => ({
        ...item,
        data: item.data.map((_item) => ({ ..._item, reaction: item._id })),
      }))

      const dataRes: { [key: string]: UserRes[] } = newUserList.reduce(
        (a, b) => ({
          ...a,
          [b._id as string]: b.data,
        }),
        {}
      )

      return {
        all: _.flattenDeep([...newUserList].map((item) => item.data)),
        ...dataRes,
      }
    } catch (error) {
      log.error(error)
      return {
        all: [],
      }
    }
  }
}

export default new MessageService()
