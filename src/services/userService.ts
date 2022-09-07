import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { FilterQuery } from "mongoose"
import User from "../models/user"
import {
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CreatePasswordServiceParams,
  CreateUserParams,
  GetTokenParams,
  getUserBlockListParams,
  IUser,
  PartnerRes,
  RegisterParams,
  UpdateProfileParams,
} from "../types"
import { ListRes } from "../types/commonType"
import { getPartnerListResponse, hashPassword } from "../utils/userResponse"

export class UserService {
  async register(params: RegisterParams): Promise<IUser> {
    const password = await hashPassword(params.password)
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

  async generateToken(user: IUser) {
    return jwt.sign({ user_id: user._id, role: user.role }, process.env.JWT_SECRET + "")
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
    const userRes: IUser | null = await User.findByIdAndUpdate(user_id, {
      $set: {
        is_online,
      },
    }).lean()

    if (userRes) {
      return { ...userRes, is_online }
    }
    return userRes
  }

  async createPassword(params: CreatePasswordServiceParams): Promise<boolean> {
    const password = await hashPassword(params.new_password)

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
    })
      .select(["_id", "user_name", "user_id", "avatar"])
      .lean()
  }

  async getUserByPhoneAndUserId(params: GetTokenParams): Promise<IUser | null> {
    return await User.findOne({ user_id: params.user_id, phone: params.phone }).lean()
  }

  async getUserByPartnerId(user_id: string): Promise<IUser | null> {
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

    return await User.findByIdAndUpdate(user_id, query).lean()
  }

  async getBlockUserList(params: getUserBlockListParams): Promise<ListRes<PartnerRes[]>> {
    const { limit, offset, blocked_user_ids } = params

    const query: FilterQuery<Object> = {
      _id: {
        $in: blocked_user_ids || [],
      },
    }
    const total = await User.countDocuments(query)
    const userRes = await User.find(query)
      .select([
        "avatar",
        "bio",
        "gender",
        "date_of_birth",
        "phone",
        "user_name",
        "is_online",
        "offline_at",
      ])
      .skip(offset)
      .limit(limit)
      .lean()

    return {
      data: getPartnerListResponse(userRes),
      hasMore: offset + (userRes || []).length < total,
      limit,
      offset,
      total,
    }
  }
}

export default new UserService()
