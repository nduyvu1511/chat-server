import AttachmentService from "../services/attachmentService"
import Express from "express"
import ResponseData from "../utils/apiRes"

class AttachmentController {
  async createAttachment(req: Express.Request, res: Express.Response) {
    try {
      const data = await AttachmentService.createAttachment(req.body)
      return res.json(new ResponseData(data))
    } catch (error) {
      console.log(error)
    }
  }
}

export default new AttachmentController()
