import Express from "express"
import { TAGS_LIMIT } from "../constant"
import TagService from "../services/tagService"
import { UserRole } from "../types"
import ResponseError from "../utils/apiError"
import ResponseData from "../utils/apiRes"

class TagController {
  async getTagMessageList(req: Express.Request, res: Express.Response) {
    try {
      const limit = Number(req.query?.limit) || TAGS_LIMIT
      const offset = Number(req.query?.offset) || 0
      const role: UserRole = req.locals.role

      const tags = await TagService.getTagMessageList({
        filter: {
          role,
        },
        limit,
        offset,
      })
      
      return res.json(new ResponseData(tags))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async createTagMessage(req: Express.Request, res: Express.Response) {
    try {
      const tag = await TagService.createTagMessage(req.body)
      return res.json(new ResponseData(tag, "Created tag message"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async updateTagMessage(req: Express.Request, res: Express.Response) {
    try {
      const tag = await TagService.updateTagMessage({ ...req.body, tag_id: req.params.tag_id })
      if (!tag) return res.json(new ResponseError("Tag ID not found"))

      return res.json(new ResponseData(tag, "Updated tag message"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async deleteTagMessage(req: Express.Request, res: Express.Response) {
    try {
      await TagService.deleteTagMesasge(req.params.tag_id as any)
      return res.json(new ResponseData({ tag_id: req.params.tag_id }, "Deleted tag"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new TagController()
