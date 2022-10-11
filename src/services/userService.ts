import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { Aggregate, FilterQuery } from "mongoose"
import log from "../config/logger"
import {
  ACCESS_TOKEN_EXPIRED,
  isObjectID,
  REFRESH_TOKEN_EXPIRED,
  SELECT_USER,
  USERS_LIMIT,
} from "../constant"
import Attachment from "../models/attachment"
import Room from "../models/room"
import Token from "../models/token"
import User from "../models/user"
import {
  AddUserIdsChattedWith,
  AddUserSocketId,
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CountMessageUnread,
  CreatePasswordServiceParams,
  CreateUserParams,
  GetTokenParams,
  GetUserByFilter,
  IAttachment,
  IUser,
  ListRes,
  LoginToSocket,
  RegisterParams,
  RequestRefreshToken,
  TopMember,
  UpdateProfile,
  UpdateProfileService,
  UserData,
  UserPopulate,
  UserRes,
  UserSocketId,
} from "../types"
import { toUserDataReponse, toUserListResponse, toUserResponse } from "../utils"
import { toListResponse } from "./../utils/commonResponse"
import AttachmentService from "./attachmentService"

class UserService {
  async register(params: RegisterParams): Promise<UserRes | null> {
    try {
      const password = await this.hashPassword(params.password)
      const avatar = await Attachment.findById(process.env.BLANK_AVATAR_ID)

      const user = new User({
        ...params,
        user_name: params.phone,
        password,
        avatar_id: avatar?._id || null,
      })
      return (await user.save()).toObject()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async createUser(user: CreateUserParams): Promise<UserPopulate | null> {
    try {
      const avatar = await AttachmentService.createAttachment({
        attachment_type: "image",
        thumbnail_url: user.avatar,
        url: user.avatar,
        asset_id: "",
        public_id: "",
      })
      const _ = new User({ ...user, avatar_id: avatar?._id || null })
      const userRes: IUser = (await _.save()).toObject()

      return { ...userRes, avatar_id: avatar }
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
      })
        .populate("avatar_id")
        .lean()
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async updateProfile(params: UpdateProfileService): Promise<UserPopulate | null> {
    try {
      const { user, ...data } = params
      let avatar: IAttachment | null = null

      if (params?.avatar && user?.avatar_id && isObjectID(user.avatar_id.toString())) {
        const _avatar: IAttachment | null = await Attachment.findById(user?.avatar_id).lean()
        if (!_avatar?._id) {
          avatar = await AttachmentService.createAttachment({
            thumbnail_url: params.avatar,
            url: params.avatar,
            attachment_type: "image",
            asset_id: "",
            public_id: "",
          })
        } else {
          if (_avatar.url !== params.avatar && _avatar?.thumbnail_url !== params.avatar)
            avatar = await AttachmentService.createAttachment({
              thumbnail_url: params.avatar,
              url: params.avatar,
              attachment_type: "image",
              asset_id: "",
              public_id: "",
            })
        }
      } else if (!params?.avatar && user?.avatar_id && isObjectID(user.avatar_id.toString())) {
        avatar = { _id: user.avatar_id } as any
      } else if (params?.avatar && !user?.avatar_id) {
        avatar = await AttachmentService.createAttachment({
          thumbnail_url: params.avatar,
          url: params.avatar,
          attachment_type: "image",
          asset_id: "",
          public_id: "",
        })
      } else {
        avatar = await Attachment.findById(process.env.BLANK_AVATAR_ID)
      }

      return await User.findByIdAndUpdate(
        user._id,
        { ...data, avatar_id: avatar?._id },
        {
          new: true,
        }
      )
        .populate("avatar_id")
        .lean()
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

  // async loginToSocket({ socket_id, user_id }: LoginToSocket): Promise<IUser | null> {
  //   try {
  //     const user = await this.getUserByUserId(user_id as any)
  //     if (!user) return null
  //     await this.addUserSocketId({ user_id, socket_id })
  //   } catch (error) {
  //     log.error(error)
  //     return null
  //   }
  // }

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

  async addUserIdsChattedWith({ user_ids }: AddUserIdsChattedWith): Promise<boolean> {
    try {
      await Promise.all(
        user_ids.map(async (user_id) => {
          const partner_ids = user_ids.filter((id) => id !== user_id)
          return await User.findByIdAndUpdate(
            user_id,
            {
              $addToSet: {
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
    return await User.findById(user_id).populate("avatar_id").lean()
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
    })
      .populate("avatar_id")
      .lean()
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
      ])

      return data
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async getMessageUnreadCount({ room_ids, user_id }: CountMessageUnread): Promise<number> {
    try {
      const data = await Room.aggregate([
        {
          $match: {
            $expr: {
              $in: ["$_id", room_ids],
            },
          },
        },
        {
          $project: {
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
          $project: {
            message_unread_ids: "$user_ids.message_unread_ids",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: {
                $cond: [{ $gt: [{ $size: "$message_unread_ids" }, 0] }, 1, 0],
              },
            },
          },
        },
      ])

      return data?.[0]?.count || 0
    } catch (error) {
      log.error(error)
      return 0
    }
  }

  async getUserByPartnerId(user_id: number): Promise<UserPopulate | null> {
    return await User.findOne({ user_id }).lean()
  }

  async getUserById(_id: string): Promise<IUser | null> {
    return await User.findById(_id).lean()
  }

  async getUserInfoByIUser(args: IUser): Promise<UserRes> {
    const attachment = args?.avatar_id ? await Attachment.findById(args.avatar_id).lean() : null
    const userPopulate: UserPopulate = { ...args, avatar_id: attachment as any }
    const message_unread_count = await this.getMessageUnreadCount({
      user_id: args._id,
      room_ids: args.room_joined_ids as any,
    })

    return { ...toUserResponse(userPopulate), message_unread_count }
  }

  async getUserByPhone(phone: string): Promise<UserPopulate | null> {
    const user: UserPopulate | null = await User.findOne({ phone }).populate("avatar_id").lean()
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
      .populate("avatar_id")
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
