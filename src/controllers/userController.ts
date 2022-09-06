import bcrypt from "bcrypt"
import Express from "express"
import userService from "../services/userService"
import { IUser, PartnerRes, UserLoginRes, UserRes } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"
import { getUserResponse } from "../utils/userResponse"
import { ListRes } from "./../types/commonType"
import { generateToken } from "./../utils/userResponse"

class UserController {
  async register(req: Express.Request, res: Express.Response) {
    try {
      const userRes = await userService.register(req.body)
      return res.json(new ResponseData<UserRes>(getUserResponse(userRes)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async generateToken(req: Express.Request, res: Express.Response) {
    try {
      const user = await userService.getUserByPhoneAndUserId(req.body)
      if (!user) {
        return res.json(new ResponseError("User not found, please register first"))
      }

      return res.json(
        new ResponseData<UserLoginRes>({
          ...getUserResponse(user),
          token: generateToken(user),
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async login(req: Express.Request, res: Express.Response) {
    const { password, phone } = req.body
    try {
      const user = await userService.getUserByPhone(phone)
      if (!user) {
        return res.json(new ResponseError("Phone number does not exist, please register first"))
      }

      if (!(await bcrypt.compare(password, user.password)))
        return res.json(new ResponseError("Password is not match"))

      return res.json(
        new ResponseData<UserLoginRes>({
          ...getUserResponse(user),
          token: generateToken(user),
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createUser(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.createUser(req.body)
      return res.json(new ResponseData<UserRes>(getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async updateProfile(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.updateProfile({ ...req.body, user_id: req.locals._id })
      if (!data) {
        return res.json(new ResponseError("User not found"))
      }
      return res.json(new ResponseData<UserRes>(getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getUserInfo(req: Express.Request, res: Express.Response) {
    try {
      console.log(req.query?.user_id)

      const data = await userService.getUserByUserId(req?.query?.user_id || req.locals._id)
      if (!data) {
        return res.json(new ResponseError("User not found"))
      }
      return res.json(new ResponseData<UserRes>(getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changePassword(req: Express.Request, res: Express.Response) {
    try {
      if (!(await bcrypt.compare(req.body.current_password, req.locals.password))) {
        return res.json(new ResponseError("Password is not match"))
      }
      await userService.createPassword({ ...req.body, _id: req.locals._id })
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

      await userService.createPassword({ ...req.body, _id: req.locals._id })
      return res.json(new ResponseData(null, "Create password successfully"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changeStatus(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.changeStatus({ ...req.body, user_id: req.locals._id })
      if (!data) {
        return res.json(new ResponseError("User not found"))
      }
      return res.json(new ResponseData<UserRes>(getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async blockOrUnBlockUser(req: Express.Request, res: Express.Response) {
    try {
      if (req.locals._id === req.body.partner_id)
        return res.json(new ResponseError("You cannot pass your id into a block list!"))

      const partner: IUser | null = await userService.getUserByUserId(req.body.partner_id)
      if (!partner) return res.json(new ResponseError("user not found"))

      await userService.blockOrUnBlockUser({
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
    const limit = Number(req.query?.limit) || 12
    const user: IUser = req.locals
    try {
      const data = await userService.getBlockUserList({
        limit,
        offset,
        blocked_user_ids: user.blocked_user_ids || [],
      })
      return res.json(new ResponseData<ListRes<PartnerRes[]>>(data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new UserController()
