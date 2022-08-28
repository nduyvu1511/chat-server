import bcrypt from "bcrypt"
import Express from "express"
import jwt from "jsonwebtoken"
import { DEFAULT_MESSAGE } from "../constant"
import userService from "../services/userService"
import { IUser, PartnerRes, UserLoginRes, UserRes } from "../types"
import ResponseData from "../utils/apiRes"
import { getUserResponse } from "../utils/user"
import { ListRes } from "./../types/commonType"

class UserController {
  async register(req: Express.Request, res: Express.Response) {
    try {
      const user = await userService.getUserByPhone(req.body.phone)
      if (user) {
        return res.json(new ResponseData<null>("duplicate phone number", 400, false, null))
      }

      const userRes = await userService.register(req.body)
      return res.json(
        new ResponseData<UserRes>(DEFAULT_MESSAGE, 200, true, getUserResponse(userRes))
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
        return res.json(
          new ResponseData<null>("Phone number not found, please register first", 400, true, null)
        )
      }

      const pwHashed = await bcrypt.compare(password, user.password)
      if (!pwHashed)
        return res.json(new ResponseData<null>("Password is not match", 400, true, null))

      const token = jwt.sign({ user_id: user._id, role: user.role }, process.env.JWT_SECRET + "")

      return res.json(
        new ResponseData<UserLoginRes>(DEFAULT_MESSAGE, 200, true, {
          ...getUserResponse(user),
          token,
        })
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createUser(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.createUser(req.body)
      return res.json(new ResponseData<UserRes>(DEFAULT_MESSAGE, 200, true, getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async updateProfile(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.updateProfile({ ...req.body, user_id: req.locals.user_id })
      if (!data) {
        return res.json(
          new ResponseData<IUser | null>("Không tìm thầy người dùng", 400, false, data)
        )
      }
      return res.json(new ResponseData<UserRes>(DEFAULT_MESSAGE, 200, true, getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async changeStatus(req: Express.Request, res: Express.Response) {
    try {
      const data = await userService.changeStatus({ ...req.body, user_id: req.locals.user_id })
      if (!data) {
        return res.json(
          new ResponseData<IUser | null>("Không tìm thầy người dùng", 400, false, data)
        )
      }
      return res.json(new ResponseData<UserRes>(DEFAULT_MESSAGE, 200, true, getUserResponse(data)))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async blockOrUnBlockUser(req: Express.Request, res: Express.Response) {
    try {
      if (req.locals.user_id === req.body.partner_id)
        return res.json(
          new ResponseData<IUser | null>(
            "You cannot pass your id into a block list!",
            400,
            false,
            null
          )
        )

      const partner: IUser | null = await userService.getUserByUserId(req.body.partner_id)
      if (!partner)
        return res.json(new ResponseData<IUser | null>("user not found", 400, false, null))

      const data = await userService.blockOrUnBlockUser({
        ...req.body,
        user_id: req.locals.user_id,
      })
      return res.json(
        new ResponseData<UserRes>(
          `${req.body.status === "block" ? "Block" : "Unblock"} user successfully`,
          200,
          true,
          getUserResponse(data)
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
      return res.json(new ResponseData<ListRes<PartnerRes[]>>(DEFAULT_MESSAGE, 200, true, data))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new UserController()
