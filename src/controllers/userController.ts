import bcrypt from "bcrypt"
import Express from "express"
import log from "../config/logger"
import { USERS_LIMIT } from "../constant"
import UserService from "../services/userService"
import { IUser, RegisterParams, UserLoginRes, UserRes } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"
import { toUserResponse } from "../utils/userResponse"

class UserController {
  async register(req: Express.Request, res: Express.Response) {
    try {
      const params: RegisterParams = req.body
      const userRes = await UserService.register(params)
      if (!userRes) return res.json(new ResponseError("Failed to register"))

      return res.json(new ResponseData(userRes))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async generateToken(req: Express.Request, res: Express.Response) {
    try {
      const user = await UserService.getUserByPhoneAndUserId(req.body)
      if (!user) return res.json(new ResponseError("User not found, please register first"))

      await
        UserService.deleteToken(user._id);

      const access_token = await UserService.generateToken(user)
      const refresh_token = await UserService.generateRefreshToken(user)

      const hash_token = await bcrypt.hash(access_token, 10);
      UserService.login(user.user_id, hash_token, req.body.device_id)

      return res.json(
        new ResponseData({
          access_token,
          refresh_token,
        })
      )
    } catch (error) {
      log.error(error)
      return res.status(400).send(error)
    }
  }

  async login(req: Express.Request, res: Express.Response) {
    const { password, phone, device_id } = req.body
    try {
      const user = await UserService.getUserByPhone(phone)
      if (!user) {
        return res.json(new ResponseError("Phone number does not exist, please register first"))
      }

      if (!user?.password)
        return res.json(new ResponseError("This account has no password, create password first"))

      if (!(await bcrypt.compare(password, user?.password || "")))
        return res.json(new ResponseError("Password is not match"))

      await
        UserService.deleteToken(user._id);

      const access_token = await UserService.generateToken(user)
      const refresh_token = await UserService.generateRefreshToken(user)

      const hash_token = await bcrypt.hash(access_token, 10);
      UserService.login(user.user_id, hash_token, device_id)

      return res.json(
        new ResponseData<UserLoginRes>({
          ...toUserResponse(user),
          access_token,
          refresh_token,
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async logout(req: Express.Request, res: Express.Response) {
    try {
      await UserService.deleteToken(req.user._id)
      return res.json(new ResponseData(null, "logout successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async requestRefreshToken(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.requestRefreshToken({
        user: req.user,
        refresh_token: req.body.refresh_token,
      })
      if (!data) return res.json(new ResponseError("Refresh token is not valid or expired"))

      return res.json(new ResponseData(data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createUser(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.createUser(req.body)
      if (!data) return res.json(new ResponseError("Failed to create new user"))
      const access_token = UserService.generateToken(data)
      const refresh_token = await UserService.generateRefreshToken(data)
      return res.json(new ResponseData({ ...toUserResponse(data), access_token, refresh_token }))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async updateProfile(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.updateProfile({ ...req.body, user: req.user })
      if (!data) return res.json(new ResponseError("User not found"))

      return res.json(new ResponseData<UserRes>(toUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUserInfo(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.getUserByUserId((req?.query?.user_id || req.user._id) as any)
      if (!data) return res.json(new ResponseError("User not found"))

      const userRes = toUserResponse(data)
      if (req.query?.user_id && req.query?.user_id?.toString() !== req.user._id.toString()) {
        // const room_id = await roomService.getRoomIdByUserId({
        //   room_joined_ids: req.user.room_joined_ids as any[],
        //   partner_id: userRes.user_id,
        // })

        return res.json(
          new ResponseData<UserRes>({
            ...userRes,
            is_yourself: req.user._id.toString() === userRes.user_id.toString(),
          })
        )
      }

      const count = await UserService.getMessageUnreadCount({
        room_ids: req.user.room_joined_ids as any[],
        user_id: req.user._id,
      })

      return res.json(
        new ResponseData<UserRes>({
          ...userRes,
          is_yourself: true,
          message_unread_count: count.message_unread_count,
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getMessageUnreadCount(req: Express.Request, res: Express.Response) {
    try {
      const message_unread_count = await UserService.getMessageUnreadCount({
        room_ids: req.user.room_joined_ids as any[],
        user_id: req.user._id,
      })

      return res.json(new ResponseData(message_unread_count))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  // async loginToSocket(req: Express.Request, res: Express.Response) {
  //   try {
  //     const user_id = req.user._id
  //     const { socket_id } = req.body

  //     const user = await UserService.addUserSocketId({ user_id, socket_id })
  //     return res.json(new ResponseData(user))
  //   } catch (error) {
  //     return res.status(400).send(error)
  //   }
  // }

  async changePassword(req: Express.Request, res: Express.Response) {
    try {
      if (!(await bcrypt.compare(req.body.current_password, req.user.password))) {
        return res.json(new ResponseError("Password is not match"))
      }
      await UserService.createPassword({ ...req.body, _id: req.user._id })
      return res.json(new ResponseData(null, "Change password successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async checkHasPassword(req: Express.Request, res: Express.Response) {
    try {
      return res.json(
        new ResponseData({
          has_password: !!req?.user?.password,
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createPassword(req: Express.Request, res: Express.Response) {
    try {
      if (req.user?.password?.length) {
        return res.json(
          new ResponseError("This account already has password, use change password instead")
        )
      }

      await UserService.createPassword({ ...req.body, _id: req.user._id })
      return res.json(new ResponseData(null, "Create password successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changeStatus(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.changeStatus({ ...req.body, user_id: req.user._id })
      if (!data) return res.json(new ResponseError("User not found"))

      return res.json(
        new ResponseData(
          { status: data.is_online, user_id: data._id },
          `Changed status to ${data.is_online ? "online" : "offline"}`
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async blockOrUnBlockUser(req: Express.Request, res: Express.Response) {
    try {
      if (req.user._id.toString() === req.body.partner_id.toString())
        return res.json(new ResponseError("You cannot pass your id into a block list!"))

      const partner = await UserService.getUserByUserId(req.body.partner_id)
      if (!partner) return res.json(new ResponseError("Partner not found"))

      await UserService.blockOrUnBlockUser({
        ...req.body,
        user_id: req.user._id,
      })

      return res.json(
        new ResponseData(
          req.body,
          `${req.body.status === "block" ? "Block" : "Unblock"} user successfully`
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getBlockUserList(req: Express.Request, res: Express.Response) {
    const offset = Number(req.query?.offset) || 0
    const limit = Number(req.query?.limit) || USERS_LIMIT
    const user: IUser = req.user
    try {
      const data = await UserService.getUserListByFilter({
        limit,
        offset,
        filter: {
          _id: {
            deleteRefreshToken: user.blocked_user_ids || [],
          },
        },
      })
      return res.json(new ResponseData(data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new UserController()
