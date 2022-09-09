import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { isObjectID, SELECT_USER } from "../constant"
import Attachment from "../models/attachment"
import User from "../models/user"
import {
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CreatePasswordServiceParams,
  CreateUserParams,
  GetTokenParams,
  GetUserByFilter,
  IUser,
  RegisterParams,
  UpdateProfile,
  UpdateProfileService,
  UserPopulate,
  UserRes,
} from "../types"
import { IAttachment, ListRes } from "../types/commonType"
import { toUserListResponse } from "../utils"
import { toListResponse } from "./../utils/commonResponse"
import AttachmentService from "./attachmentService"

class UserService {
  async register(params: RegisterParams): Promise<UserRes> {
    const password = await this.hashPassword(params.password)
    const avatar = await Attachment.findById(process.env.BLANK_AVATAR_ID)

    const user = new User({
      ...params,
      user_name: params.phone,
      password,
      avatar_id: avatar?._id || null,
    })
    return (await user.save()).toObject()
  }

  async createUser(user: CreateUserParams): Promise<UserPopulate> {
    const avatar = await AttachmentService.createAttachment({
      attachment_type: "image",
      thumbnail_url: user.avatar,
      url: user.avatar,
      desc: "avatar",
    })
    const _ = new User({ ...user, avatar_id: avatar?._id || null })
    const userRes: IUser = (await _.save()).toObject()

    return { ...userRes, avatar_id: avatar }
  }

  async updateAvatarProfile(
    params: UpdateProfile & { _id: ObjectId }
  ): Promise<UserPopulate | null> {
    const { _id, ...rest } = params

    return await User.findByIdAndUpdate(_id, rest, {
      new: true,
    })
      .populate("avatar_id")
      .lean()
  }

  async updateProfile(params: UpdateProfileService): Promise<UserPopulate | null> {
    const { user, ...data } = params
    let avatar: IAttachment | null = null

    if (params?.avatar && user?.avatar_id && isObjectID(user.avatar_id.toString())) {
      const _avatar: IAttachment | null = await Attachment.findById(user?.avatar_id).lean()
      if (!_avatar?._id) {
        avatar = await AttachmentService.createAttachment({
          thumbnail_url: params.avatar,
          url: params.avatar,
          attachment_type: "image",
          desc: "avatar",
        })
      } else {
        if (_avatar.url !== params.avatar && _avatar?.thumbnail_url !== params.avatar)
          avatar = await AttachmentService.createAttachment({
            thumbnail_url: params.avatar,
            url: params.avatar,
            attachment_type: "image",
            desc: "avatar",
          })
      }
    } else if (!params?.avatar && user?.avatar_id && isObjectID(user.avatar_id.toString())) {
      avatar = { _id: user.avatar_id } as any
    } else if (params?.avatar && !user?.avatar_id) {
      avatar = await AttachmentService.createAttachment({
        thumbnail_url: params.avatar,
        url: params.avatar,
        attachment_type: "image",
        desc: "avatar",
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
  }

  async changeStatus(params: changeUserStatusParams): Promise<IUser | null> {
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
  }

  async createPassword(params: CreatePasswordServiceParams): Promise<boolean> {
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
    const user: UserPopulate | null = await User.findOne({
      user_id: params.user_id,
      phone: params.phone,
    })
      .populate("avatar_id")
      .lean()
    return user
  }

  async getUserByPartnerId(user_id: number): Promise<UserPopulate | null> {
    const user: UserPopulate | null = await User.findOne({ user_id }).lean()
    return user
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
    const { limit, offset, filter } = params

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

  generateToken(user: IUser): string {
    return jwt.sign(
      { _id: user._id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET + ""
    )
  }
}

export default new UserService()
