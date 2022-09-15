import bcrypt from "bcrypt"
import Express from "express"
import { USERS_LIMIT } from "../constant"
import UserService from "../services/userService"
import { IUser, UserLoginRes, UserRes } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"
import { toUserDataReponse, toUserResponse } from "../utils/userResponse"

class UserController {
  async register(req: Express.Request, res: Express.Response) {
    try {
      const userRes = await UserService.register(req.body)
      return res.json(new ResponseData(userRes))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async generateToken(req: Express.Request, res: Express.Response) {
    try {
      const user = await UserService.getUserByPhoneAndUserId(req.body)
      if (!user) return res.json(new ResponseError("User not found, please register first"))

      return res.json(
        new ResponseData<UserLoginRes>({
          ...toUserResponse(user),
          token: UserService.generateToken(user as any),
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async login(req: Express.Request, res: Express.Response) {
    const { password, phone } = req.body
    try {
      const user = await UserService.getUserByPhone(phone)
      if (!user) {
        return res.json(new ResponseError("Phone number does not exist, please register first"))
      }

      if (!user?.password)
        return res.json(new ResponseError("This account has no password, create password first"))

      if (!(await bcrypt.compare(password, user?.password || "")))
        return res.json(new ResponseError("Password is not match"))

      return res.json(
        new ResponseData<UserLoginRes>({
          ...toUserResponse(user),
          token: UserService.generateToken(user as any),
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createUser(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.createUser(req.body)
      return res.json(new ResponseData<UserRes>(toUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async updateProfile(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.updateProfile({ ...req.body, user: req.locals })
      if (!data) return res.json(new ResponseError("User not found"))

      return res.json(new ResponseData<UserRes>(toUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUserInfo(req: Express.Request, res: Express.Response) {
    try {
      const data = await UserService.getUserByUserId(req?.query?.user_id || req.locals._id)
      if (!data) return res.json(new ResponseError("User not found"))

      return res.json(new ResponseData<UserRes>(toUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async loginToSocket(req: Express.Request, res: Express.Response) {
    try {
      const user_id = req.locals._id
      // const { socket_id } = req.body
      const user = await UserService.getUserByUserId(user_id)
      if (!user) return res.json(new ResponseError("User not found"))
      // await UserService.addUserSocketId({ user_id, socket_id })
      // socket.emit(`user_login_${user.user_id}`, user)
      return res.json(new ResponseData(toUserDataReponse(user)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changePassword(req: Express.Request, res: Express.Response) {
    try {
      if (!(await bcrypt.compare(req.body.current_password, req.locals.password))) {
        return res.json(new ResponseError("Password is not match"))
      }
      await UserService.createPassword({ ...req.body, _id: req.locals._id })
      return res.json(new ResponseData(null, "Change password successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async checkHasPassword(req: Express.Request, res: Express.Response) {
    try {
      return res.json(
        new ResponseData(
          {
            has_password: !!req?.locals?.password,
          },
          "Change password successfully"
        )
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createPassword(req: Express.Request, res: Express.Response) {
    try {
      if (req.locals?.password?.length) {
        return res.json(
          new ResponseError("This account already has password, use change password instead")
        )
      }

      await UserService.createPassword({ ...req.body, _id: req.locals._id })
      return res.json(new ResponseData(null, "Create password successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changeStatus(req: Express.Request, res: Express.Response) {
    console.log("call to change status of user")
    try {
      const data = await UserService.changeStatus({ ...req.body, user_id: req.locals._id })
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
      if (req.locals._id.toString() === req.body.partner_id.toString())
        return res.json(new ResponseError("You cannot pass your id into a block list!"))

      const partner = await UserService.getUserByUserId(req.body.partner_id)
      if (!partner) return res.json(new ResponseError("Partner not found"))

      await UserService.blockOrUnBlockUser({
        ...req.body,
        user_id: req.locals._id,
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
    const user: IUser = req.locals
    try {
      const data = await UserService.getUserListByFilter({
        limit,
        offset,
        filter: {
          _id: {
            $in: user.blocked_user_ids || [],
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
