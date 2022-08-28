import Express from "express"
import { DEFAULT_MESSAGE } from "../constant"
import RoomService from "../services/roomService"
import UserService from "../services/userService"
import ResponseData from "../utils/apiRes"

class RoomController {
  async createPrivateChat(req: Express.Request, res: Express.Response) {
    try {
      const { user_id } = req.locals
      if (user_id === req.body.partner_id)
        return res.json(
          new ResponseData("Can not create room chat with only one person", 400, false, null)
        )

      const partner = await UserService.getUserByUserId(req.body.partner_id)
      if (!partner)
        return res.json(
          new ResponseData(
            "Create room chat failed because partner ID is invalid",
            400,
            false,
            null
          )
        )
      const user = await UserService.getUserByUserId(user_id)
      if (!user)
        return res.json(
          new ResponseData(
            "Create room chat failed because partner ID is invalid",
            400,
            false,
            null
          )
        )

      const room = await RoomService.createPrivateChat({ partner, user })
      return res.json(new ResponseData("create room chat successfully", 200, true, room))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createGroupChat(req: Express.Request, res: Express.Response) {
    try {
      let isValid
      const { user_id } = req.locals

      if (req.body.member_ids.length === 1 && req.body.member_ids.includes(user_id)) {
        return res.json(
          new ResponseData(
            "Missing member id, can not create room chat with one person",
            400,
            false,
            null
          )
        )
      }

      const users = await Promise.all(
        [...req.body.member_ids]
          .filter((id) => id !== user_id)
          .map(async (userId: string) => {
            const user = await UserService.getUserByUserId(userId)
            if (!user) {
              isValid = false
              return
            }
            return user
          })
      )

      if (isValid === false)
        return res.json(
          new ResponseData(
            "Create room chat failed because member ids is not valid",
            400,
            false,
            null
          )
        )
      // const room = await RoomService.createRoomChat({ ...req.body, member_ids: users, user_id })
      // return res.json(new ResponseData("create room chat successfully", 200, true, room))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async getRoomList(req: Express.Request, res: Express.Response) {
    try {
      const { user_id } = req.locals
      const limit = Number(req.query?.limit) || 0
      const offset = Number(req.query?.offset) || 0
      const search_term = req.query?.search_term + "" || ""
      const user = await UserService.getUserByUserId(user_id)
      const roomList = await RoomService.getRoomList({
        limit,
        offset,
        search_term,
        room_ids: user?.room_joined_ids || [],
      })
      return res.json(new ResponseData(DEFAULT_MESSAGE, 200, true, roomList))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new RoomController()
