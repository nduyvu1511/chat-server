import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import log from "../config/logger"
import { ACCESS_TOKEN_EXPIRED, REFRESH_TOKEN_EXPIRED, SELECT_USER, USERS_LIMIT } from "../constant"
import Room from "../models/room"
import Token from "../models/token"
import User from "../models/user"
import {
  AddUserSocketId,
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CountMessageUnread,
  CreatePasswordServiceParams,
  CreateUserParams,
  GetTokenParams,
  GetUserByFilter,
  IUser,
  ListRes,
  MessageUnreadCountQueryRes,
  MessageUnreadCountRes,
  RegisterParams,
  RequestRefreshToken,
  SetUserIdsChattedWith,
  TopMember,
  UpdateProfile,
  UpdateProfileService,
  UserPopulate,
  UserRes,
  UserSocketId,
} from "../types"
import { toUserListResponse, toUserResponse } from "../utils"
import { toListResponse } from "./../utils/commonResponse"
import RoomService from "./roomService"

class UserService {
  async createChatWithAdmin(user: IUser): Promise<boolean> {
    try {
      if (user.role === "admin") return false

      const adminList: IUser[] = await User.find({ role: "admin" }).lean()

      if (adminList?.length) {
        await Promise.all(
          adminList.map(async (partner) => {
            await RoomService.createSingleChat({ partner, user, room_type: "admin" })
            return true
          })
        )
      }

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async register(params: RegisterParams): Promise<UserRes | null> {
    try {
      const password = await this.hashPassword(params.password)

      const user = new User({
        ...params,
        user_name: params.phone,
        password,
      })

      await this.createChatWithAdmin(user)

      return (await user.save()).toObject()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async createUser(user: CreateUserParams): Promise<UserPopulate | null> {
    try {
      const data = new User(user)
      const userRes = await data.save()

      if (userRes?.role === "admin") return userRes

      await this.createChatWithAdmin(userRes)

      return userRes
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async updateAvatarProfile(
    params: UpdateProfile & { _id: ObjectId }
  ): Promise<UserPopulate | null> {
    try {
      const { _id, ...rest } = params

      return await User.findByIdAndUpdate(_id, rest, {
        new: true,
      }).lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async updateProfile(params: UpdateProfileService): Promise<UserPopulate | null> {
    try {
      const { user, ...data } = params

      return await User.findByIdAndUpdate(user._id, data, {
        new: true,
      }).lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async changeStatus(params: changeUserStatusParams): Promise<IUser | null> {
    try {
      const { user_id, is_online } = params
      const userRes: IUser | null = await User.findByIdAndUpdate(
        user_id,
        {
          $set: {
            is_online,
          },
        },
        { new: true }
      ).lean()

      return userRes
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async createPassword(params: CreatePasswordServiceParams): Promise<boolean> {
    try {
      const password = await this.hashPassword(params.new_password)

      await User.findByIdAndUpdate(
        params._id,
        {
          $set: {
            password: password,
          },
        },
        { new: true }
      ).lean()

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async addUserSocketId({ socket_id, user_id }: AddUserSocketId): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        user_id,
        {
          $set: {
            socket_id,
            is_online: true,
            offline_at: null,
          },
        },
        {
          new: true,
        }
      ).lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async getSocketIdsByUserIds(user_ids: string[]): Promise<UserSocketId[]> {
    try {
      const users: IUser[] = await User.find({
        _id: {
          $in: user_ids,
        },
      })
        .select(["socket_id", "room_joined_ids"])
        .lean()

      if (!users?.length) return []
      return users.map((item) => ({
        socket_id: item.socket_id,
        user_id: item._id,
        room_joined_ids: item?.room_joined_ids || [],
      }))
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async removeUserSocketId({ socket_id }: { socket_id: string }): Promise<IUser | null> {
    try {
      return await User.findOneAndUpdate(
        { socket_id },
        {
          $set: {
            socket_id: null,
            is_online: false,
            offline_at: Date.now(),
          },
        },
        {
          new: true,
        }
      ).lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async setUserIdsChattedWith({ user_ids, type }: SetUserIdsChattedWith): Promise<boolean> {
    try {
      await Promise.all(
        user_ids.map(async (user_id) => {
          const partner_ids = user_ids.filter((id) => id !== user_id)
          return await User.findByIdAndUpdate(
            user_id,
            {
              [type === "add" ? "$addToSet" : "$pull"]: {
                user_chatted_with_ids: { $each: partner_ids },
              },
            },
            {
              new: true,
            }
          )
        })
      )
      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  async getUserByUserId(user_id: ObjectId): Promise<UserPopulate | null> {
    return await User.findById(user_id).lean()
  }

  async getUserIds(user_ids: number[]): Promise<IUser[]> {
    return await User.find({
      user_id: {
        $in: user_ids,
      },
    }).lean()
  }

  async getUserByPhoneAndUserId(params: GetTokenParams): Promise<UserPopulate | null> {
    return await User.findOne({
      user_id: params.user_id,
      phone: params.phone,
    }).lean()
  }

  async getTopMembers(room_ids: string[]): Promise<TopMember[]> {
    try {
      const data: TopMember[] = await User.aggregate([
        {
          $match: {
            $expr: {
              $in: ["$_id", room_ids],
            },
          },
        },
        {
          $sort: { is_online: -1 },
        },
        {
          $limit: 4,
        },
        // {
        //   $lookup: {
        //     from: "attachments",
        //     localField: "avatar_id",
        //     foreignField: "_id",
        //     as: "avatar_id",
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$avatar_id",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $project: {
            _id: 0,
            user_id: "$_id",
            user_avatar: { $ifNull: ["$avatar", null] },
            user_name: "$user_name",
            is_online: "$is_online",
          },
        },
      ])

      return data
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async getMessageUnreadCount({
    room_ids,
    user_id,
  }: CountMessageUnread): Promise<MessageUnreadCountRes> {
    try {
      const data: MessageUnreadCountQueryRes[] = await Room.aggregate([
        {
          $match: {
            $expr: {
              $in: ["$_id", room_ids],
            },
          },
        },
        {
          $project: {
            room_id: "$_id",
            user_ids: {
              $filter: {
                input: "$member_ids",
                as: "member_ids",
                cond: {
                  $eq: ["$$member_ids.user_id", { $toObjectId: user_id }],
                },
              },
            },
          },
        },
        {
          $unwind: "$user_ids",
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$$ROOT", "$user_ids"],
            },
          },
        },
        {
          $project: {
            _id: "$room_id",
            message_unread_ids: 1,
          },
        },
        {
          $match: {
            message_unread_ids: {
              $gt: [{ $size: "$message_unread_ids" }, 0],
            },
          },
        },
      ])

      return {
        room_ids: (data || [])?.map((item) => item._id),
        message_unread_count: data?.length || 0,
      }
    } catch (error) {
      log.error(error)
      return {
        message_unread_count: 0,
        room_ids: [],
      }
    }
  }

  async getUserByPartnerId(user_id: number): Promise<UserPopulate | null> {
    return await User.findOne({ user_id }).lean()
  }

  async getUserById(_id: string): Promise<IUser | null> {
    return await User.findById(_id).lean()
  }

  async getUserInfoByIUser(args: IUser): Promise<UserRes> {
    const count = await this.getMessageUnreadCount({
      user_id: args._id,
      room_ids: args.room_joined_ids as any,
    })

    return { ...toUserResponse(args), message_unread_count: count.message_unread_count }
  }

  async getUserByPhone(phone: string): Promise<UserPopulate | null> {
    const user: UserPopulate | null = await User.findOne({ phone }).lean()
    return user
  }

  async blockOrUnBlockUser(params: BlockOrUnBlockUserParams): Promise<IUser> {
    const { user_id, partner_id, status } = params

    const query: FilterQuery<Object> =
      status === "block"
        ? {
            $addToSet: {
              blocked_user_ids: partner_id,
            },
          }
        : {
            $pull: {
              blocked_user_ids: partner_id,
            },
          }

    return await User.findByIdAndUpdate(user_id, query, { new: true }).lean()
  }

  async getUserListByFilter(params: GetUserByFilter): Promise<ListRes<UserRes[]>> {
    const { limit = USERS_LIMIT, offset = 0, filter } = params

    const total = await User.countDocuments(filter)
    const userRes: UserPopulate[] = await User.find(filter)
      .select(SELECT_USER)
      .limit(limit)
      .skip(offset)
      .lean()

    return toListResponse({
      data: toUserListResponse(userRes),
      limit,
      offset,
      total,
    })
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async generateRefreshToken(user: IUser | UserPopulate): Promise<string> {
    const token = jwt.sign(
      { _id: user._id, user_id: user.user_id, role: user.role },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: REFRESH_TOKEN_EXPIRED,
      }
    )

    const data = new Token({ token, user_id: user._id })
    await data.save()

    return token
  }

  async deleteRefreshToken(user_id: string): Promise<boolean> {
    await Token.findOneAndDelete({ user_id })
    return true
  }

  generateToken(user: IUser | UserPopulate): string {
    return jwt.sign(
      { _id: user._id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: ACCESS_TOKEN_EXPIRED,
      }
    )
  }

  async requestRefreshToken({ user, refresh_token }: RequestRefreshToken): Promise<{
    refresh_token: string
    access_token: string
  } | null> {
    const token = await Token.findOne({ token: refresh_token })
    if (!token) return null

    jwt.sign(
      { _id: user._id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: REFRESH_TOKEN_EXPIRED,
      }
    )

    const access_token = this.generateToken(user)
    const _refresh_token = await this.generateRefreshToken(user)

    return {
      access_token,
      refresh_token: _refresh_token,
    }
  }
}

export default new UserService()
