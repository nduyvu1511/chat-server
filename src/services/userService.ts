import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import { SELECT_USER } from "../constant"
import User from "../models/user"
import {
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CreatePasswordServiceParams,
  CreateUserParams,
  GetTokenParams,
  getUserBlockListParams,
  IUser,
  RegisterParams,
  UpdateProfileParams,
  UserRes,
} from "../types"
import { ListRes } from "../types/commonType"
import { toUserListResponse } from "../utils"

export class UserService {
  async register(params: RegisterParams): Promise<IUser> {
    const password = await this.hashPassword(params.password)
    const user = new User({
      ...params,
      user_name: params.phone,
      password,
    })
    return await user.save()
  }

  async createUser(user: CreateUserParams): Promise<IUser> {
    const userRes = new User(user)
    await userRes.save()
    return userRes
  }

  async updateProfile(params: UpdateProfileParams): Promise<IUser | null> {
    const { user_id, ...data } = params
    const userRes: IUser | null = await User.findByIdAndUpdate(user_id, data, {
      new: true,
    })
    return userRes
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

  async getUserByUserId(user_id: ObjectId): Promise<IUser | null> {
    return await User.findById(user_id).lean()
  }

  async getUserIds(user_ids: number[]): Promise<IUser[]> {
    return await User.find({
      user_id: {
        $in: user_ids,
      },
    }).lean()
  }

  async getUserByPhoneAndUserId(params: GetTokenParams): Promise<IUser | null> {
    return await User.findOne({ user_id: params.user_id, phone: params.phone }).lean()
  }

  async getUserByPartnerId(user_id: number): Promise<IUser | null> {
    return await User.findOne({ user_id }).lean()
  }

  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone }).lean()
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

  async getBlockUserList(params: getUserBlockListParams): Promise<ListRes<UserRes[]>> {
    const { limit, offset, blocked_user_ids } = params

    const query: FilterQuery<Object> = {
      _id: {
        $in: blocked_user_ids || [],
      },
    }
    const total = await User.countDocuments(query)
    const userRes: IUser[] = await User.find(query)
      .select(SELECT_USER)
      .limit(limit)
      .skip(offset)
      .lean()

    return {
      data: toUserListResponse(userRes),
      hasMore: offset + (userRes || []).length < total,
      limit,
      offset,
      total,
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  generateToken(user: IUser): string {
    return jwt.sign({ user_id: user._id, role: user.role }, process.env.JWT_SECRET + "")
  }
}

export default new UserService()
