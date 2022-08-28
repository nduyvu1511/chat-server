import bcrypt from "bcrypt"
import { FilterQuery } from "mongoose"
import User from "../models/user"
import {
  BlockOrUnBlockUserParams,
  changeUserStatusParams,
  CreateUserParams,
  getUserBlockListParams,
  IUser,
  PartnerRes,
  RegisterParams,
  UpdateProfileParams,
} from "../types"
import { ListRes } from "../types/commonType"
import { getPartnerListResponse } from "../utils/user"

export class UserService {
  async register(params: RegisterParams): Promise<IUser> {
    const { phone, role } = params
    const password = await bcrypt.hash(params.password, 10)
    const user = new User({
      phone,
      password,
      user_name: `USER_${params.phone}`,
      role,
    })
    const userRes = await user.save()
    return userRes
  }

  async createUser(user: CreateUserParams): Promise<IUser> {
    const password = await bcrypt.hash(user.phone, 10)
    const userRes = new User({ ...user, password })
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

  async getUserByUserId(user_id: string): Promise<IUser | null> {
    return await User.findById(user_id)
      .select([
        "_id",
        "phone",
        "user_name",
        "role",
        "is_online",
        "avatar",
        "bio",
        "date_of_birth",
        "gender",
      ])
      .lean()
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

    const userRes: IUser = await User.findByIdAndUpdate(user_id, query).lean()
    return userRes
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
