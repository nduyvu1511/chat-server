import { ObjectID, ObjectId } from "mongodb"
import { PipelineStage, _UpdateQueryDef } from "mongoose"
import log from "../config/logger"
import { isObjectID, MESSAGES_LIMIT, SELECT_ROOM, SELECT_USER, USERS_LIMIT } from "../constant"
import Message from "../models/message"
import Room from "../models/room"
import User from "../models/user"
import {
  AddMessageUnreadService,
  AttachmentRes,
  ClearMessageUnreadService,
  CreateGroupChatServicesParams,
  createSingleChatServices,
  GetRoomDetailService,
  GetRoomIdByUserId,
  IAttachment,
  IMessage,
  IRoom,
  ListRes,
  MessagePopulate,
  MessageRes,
  QueryMembersInRoomService,
  QueryRoomServiceParams,
  RoomDetailRes,
  RoomInfoRes,
  RoomMemberRes,
  RoomMemberWithId,
  RoomPopulate,
  RoomRes,
  UpdateRoomInfo,
  UpdateRoomInfoService,
  UserPopulate,
  UserSocketId,
} from "../types"
import {
  toAttachmentResponse,
  toListResponse,
  toRoomListResponse,
  toRoomMemberListResponse,
  toRoomMemberResponse,
  toRoomOfflineAt,
} from "../utils"
import { toMessageListResponse } from "../utils/messageResponse"
import { GetMessagesByFilter } from "../validators"
import UserService from "./userService"

class RoomService {
  async createSingleChat(params: createSingleChatServices): Promise<IRoom | null> {
    try {
      const { partner, user } = params

      const room = new Room({
        room_type: "single",
        room_name: null,
        member_ids: [{ user_id: user._id }, { user_id: partner._id }],
      })

      const roomRes: IRoom = (await room.save()).toObject()
      await this.saveRoomToUserIds([partner._id, user._id], room._id)

      return roomRes
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async getRoomIdByUserId({
    room_joined_ids,
    partner_id,
  }: GetRoomIdByUserId): Promise<ObjectId | undefined> {
    try {
      const roomIds = await this.getSingleRoomIds(room_joined_ids as any[])

      let room_id
      roomIds.forEach((room) => {
        room.member_ids.forEach((item) => {
          if (item.user_id.toString() === partner_id.toString()) {
            room_id = room._id
            return
          }
        })
      })

      return room_id
    } catch (error) {
      log.error(error)
      return undefined
    }
  }

  async getSocketIdsFromRoom(room_id: string): Promise<UserSocketId[]> {
    const room: IRoom | null = await Room.findById(room_id)
    if (!room?.member_ids?.length) return []
    return await UserService.getSocketIdsByUserIds(
      room.member_ids.map((item) => item.user_id.toString())
    )
  }

  async createGroupChat(params: CreateGroupChatServicesParams): Promise<IRoom | null> {
    try {
      const { member_ids, room_avatar_id, room_name } = params

      const room = new Room({
        room_type: "group",
        room_avatar_id: room_avatar_id || null,
        room_name: room_name || null,
        member_ids: member_ids?.map((user_id) => ({ user_id })),
      })

      const roomRes: IRoom = (await room.save()).toObject()
      await this.saveRoomToUserIds(member_ids, room._id)

      return roomRes
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async getSingleRoomIds(room_ids: string[]): Promise<RoomMemberWithId[]> {
    return await Room.find({
      $and: [{ _id: { $in: room_ids } }, { room_type: "single" }],
    })
      .select(["member_ids"])
      .lean()
  }

  async deleteRoomFromUserIds(user_ids: string[], room_id: string) {
    try {
      await Promise.all(
        user_ids.map(async (user_id) => {
          const user = await User.findByIdAndUpdate(user_id, {
            $pull: {
              room_joined_ids: room_id,
            },
          })
          return user
        })
      )
    } catch (error) {
      return null
    }
  }

  async saveRoomToUserIds(user_ids: ObjectId[], room_id: ObjectId) {
    try {
      await Promise.all(
        user_ids.map(async (user_id) => {
          const user = await User.findByIdAndUpdate(user_id, {
            $addToSet: {
              room_joined_ids: room_id,
            },
          })
          return user
        })
      )
      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async addMessageUnreadToRoom(params: AddMessageUnreadService): Promise<IRoom | null> {
    const { message_id, room_id, user_id } = params
    try {
      return await Room.findByIdAndUpdate(
        room_id,
        {
          $addToSet: {
            "member_ids.$[e1].message_unread_ids": message_id,
          },
        },
        {
          arrayFilters: [{ "e1.user_id": user_id }],
          new: true,
        }
      )
        .select(["member_ids"])
        .lean()
    } catch (error) {
      return null
    }
  }

  async clearMessageUnreadFromRoom(params: ClearMessageUnreadService): Promise<IRoom | null> {
    const { room_id, user_id } = params
    try {
      return await Room.findByIdAndUpdate(
        room_id,
        {
          "member_ids.$[e1].message_unread_ids": [],
        },
        {
          arrayFilters: [{ "e1.user_id": user_id }],
          new: true,
        }
      )
    } catch (error) {
      return null
    }
  }

  async getRoomDetail(params: GetRoomDetailService): Promise<RoomDetailRes | null> {
    try {
      const room: any = await Room.findById(params.room_id)
        .select(SELECT_ROOM)
        .populate("room_avatar_id")
        .lean()
      if (!room?._id || room.is_deleted) return null

      // Get members in room
      const members = await this.getMembersInRoom({
        limit: USERS_LIMIT,
        offset: 0,
        room_id: room._id,
      })

      // const members

      // Get messages in room
      const messages = await this.getMessagesByFilter({
        limit: MESSAGES_LIMIT,
        offset: 0,
        current_user: params.user,
        filter: { room_id: room._id },
      })

      // Get messages pinned in room
      const pinned_messages = await this.getMessagesByFilter({
        limit: MESSAGES_LIMIT,
        offset: 0,
        current_user: params.user,
        filter: {
          _id: {
            $in: room.pinned_message_ids,
          },
        },
      })

      // Get leader room info
      const leader_info: UserPopulate | null = room?.leader_id
        ? await User.findById(room.leader_id).populate("avatar_id")
        : null

      let room_name: null | string = room?.room_name
      let room_avatar: AttachmentRes | null = room?.room_avatar_id
        ? toAttachmentResponse(room?.room_avatar_id)
        : null

      if (room.room_type === "single") {
        const partner = members.data.find(
          (item) => item.user_id.toString() !== params.user._id.toString()
        )
        room_name = partner?.user_name || room.room_name || null
        room_avatar = partner?.avatar || null
      }

      return {
        room_id: room._id,
        room_type: room.room_type,
        room_name,
        room_avatar,
        leader_info: leader_info?._id ? toRoomMemberResponse(leader_info) : null,
        member_count: room.member_ids?.length || 0,
        is_online: members.data?.filter((item) => item.is_online)?.length >= 2,
        offline_at: toRoomOfflineAt({ current_user_id: params.user._id, data: members.data }),
        members,
        messages,
        pinned_messages,
      }
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async getMembersInRoom(params: QueryMembersInRoomService): Promise<ListRes<RoomMemberRes[]>> {
    const { limit, offset, room_id } = params

    const room = await Room.findById(room_id).select(SELECT_ROOM)
    const filter = {
      _id: {
        $in: room?.member_ids?.map((item) => item.user_id) || [],
      },
    }
    const members: UserPopulate[] = await User.find(filter)
      .populate("avatar_id")
      .limit(limit)
      .skip(offset)
      .select(SELECT_USER)
      .lean()
    const total = await User.countDocuments(filter)

    return toListResponse({ limit, offset, total, data: toRoomMemberListResponse(members) })
  }

  async getRoomList(params: QueryRoomServiceParams): Promise<ListRes<RoomRes[]>> {
    const { limit, offset, search_term, room_ids, current_user } = params

    const filter = {
      $and: [
        {
          _id: {
            $in: room_ids,
          },
        },
        {
          is_deleted: false,
        },
      ],
    }

    const query: PipelineStage[] = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "attachments",
          localField: "room_avatar_id",
          foreignField: "_id",
          as: "room_avatar_id",
        },
      },
      {
        $unwind: {
          path: "$room_avatar_id",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Get Members in room
      {
        $lookup: {
          from: "users",
          localField: "member_ids.user_id",
          foreignField: "_id",
          as: "top_members",
          pipeline: [
            {
              $sort: { is_online: -1 },
            },
            {
              $limit: 4,
            },
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
                user_avatar: "$avatar_id.thumbnail_url",
                user_name: "$user_name",
                is_online: "$is_online",
              },
            },
          ],
        },
      },
      {
        $match: search_term
          ? {
              $or: [
                {
                  room_name: {
                    $regex: search_term,
                    $options: "i",
                  },
                },
                {
                  "top_members.user_name": {
                    $regex: search_term,
                    $options: "i",
                  },
                },
              ],
            }
          : {},
      },
      // Get last message in room
      {
        $lookup: {
          from: "messages",
          localField: "last_message_id",
          foreignField: "_id",
          as: "last_message_id",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_id",
                pipeline: [
                  {
                    $project: {
                      user_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                message_id: "$_id",
                _id: 0,
                text: 1,
                location: 1,
                user_name: "$user_id.user_name",
                user_id: "$user_id._id",
                attachment_ids: 1,
                created_at: 1,
              },
            },
            {
              $unwind: {
                path: "$user_name",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$user_id",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$last_message_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          room_id: "$_id",
          room_name: "$room_name",
          room_type: "$room_type",
          last_message: "$last_message_id",
          member_count: {
            $size: "$member_ids",
          },
          top_members: 1,
          message_unread_count: {
            $filter: {
              input: "$member_ids",
              as: "item",
              cond: { $eq: ["$$item.user_id", new ObjectId(current_user._id)] },
            },
          },
          room_avatar: "$room_avatar_id.thumbnail_url",
        },
      },
      {
        $set: {
          message_unread_count: {
            $arrayElemAt: ["$message_unread_count.message_unread_ids", 0],
          },
        },
      },
      {
        $sort: { "last_message.created_at": -1 },
      },
    ]

    const data: RoomPopulate[] = await Room.aggregate([
      { $limit: offset + limit },
      { $skip: offset },
      ...query,
    ])

    const total = search_term ? data.length : await Room.countDocuments(filter)

    return toListResponse({
      limit,
      offset,
      total,
      data: toRoomListResponse({ current_user, data: data }),
    })
  }

  async getRoomById(room_id: ObjectId): Promise<IRoom | null> {
    return await Room.findById(room_id).select(SELECT_ROOM)
  }

  async pinMessageToRoom(params: IMessage): Promise<IRoom | null> {
    try {
      return await Room.findByIdAndUpdate(params.room_id, {
        $addToSet: {
          pinned_message_ids: params._id,
        },
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async deleteMessagePinnedFromRoom(params: IMessage): Promise<IRoom | null> {
    try {
      return await Room.findByIdAndUpdate(params.room_id, {
        $pull: {
          pinned_message_ids: params._id,
        },
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async softDeleteRoom(room_id: ObjectId): Promise<boolean> {
    try {
      const room: IRoom | null = await Room.findByIdAndUpdate(room_id, {
        $set: {
          is_deleted: true,
          deleted_at: Date.now(),
        },
      }).lean()
      if (!room) return false

      // await User.updateMany(
      //   {
      //     _id: {
      //       $in: room.member_ids?.map((item) => item.user_id),
      //     },
      //   },
      //   {
      //     $pull: {
      //       room_joined_ids: new ObjectId(room._id),
      //     },
      //   }
      // )

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async restoreSoftDeleteRoom(room_id: ObjectId): Promise<boolean> {
    try {
      const room: IRoom = await Room.findByIdAndUpdate(room_id, {
        $set: {
          is_deleted: false,
          updated_at: Date.now(),
        },
      }).lean()
      if (!room) return false

      // await User.updateMany(
      //   {
      //     _id: {
      //       $in: room.member_ids?.map((item) => item.user_id),
      //     },
      //   },
      //   {
      //     $addToSet: {
      //       room_joined_ids: new ObjectId(room._id),
      //     },
      //   }
      // )

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async getMessagesByFilter(params: GetMessagesByFilter): Promise<ListRes<MessageRes[]>> {
    const { limit, offset, current_user, filter } = params

    const messages: MessagePopulate[] = await Message.find(filter)
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
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 })
      .lean()

    const total = await Message.countDocuments(filter)

    return toListResponse({
      limit,
      offset,
      total,
      data: toMessageListResponse({ data: messages, current_user }),
    })
  }

  async updateRoomInfo(params: UpdateRoomInfoService): Promise<RoomInfoRes | null> {
    const { room_avatar_id, room_name, room_id } = params

    const updateQuery: _UpdateQueryDef<IRoom> = {}
    if (room_avatar_id && isObjectID(room_avatar_id.toString())) {
      updateQuery.room_avatar_id = room_avatar_id
    }
    if (room_name) {
      updateQuery.room_name = room_name
    }

    const room: Omit<IRoom, "room_avatar_id"> & { room_avatar_id: IAttachment } =
      await Room.findByIdAndUpdate(
        room_id,
        {
          $set: updateQuery,
        },
        { new: true }
      )
        .populate("room_avatar_id")
        .lean()

    if (!room) return null

    return {
      member_count: room.member_ids.length || 0,
      room_id: room._id,
      room_name: room.room_name,
      room_type: room.room_type,
      room_avatar: room?.room_avatar_id ? toAttachmentResponse(room.room_avatar_id) : null,
    }
  }
}

export default new RoomService()
