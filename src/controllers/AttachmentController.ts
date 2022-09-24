import Express from "express"
import AttachmentService from "../services/attachmentService"
import UploadService from "../services/uploadService"
import { AttachmentRes } from "../types"
import { toAttachmentListResponse, toAttachmentResponse } from "../utils"
import ResponseError from "../utils/apiError"
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

  async uploadMultipleImage(req: Express.Request, res: Express.Response) {
    try {
      if (!req.files?.length) return res.json(new ResponseError("Missing file in form body"))

      const images = await UploadService.uploadMultipleImage({
        files: req.files as any,
        folder: "message/image",
      })
      if (!images) return res.json(new ResponseError("Failed to upload image"))

      const data = await AttachmentService.createMultipleAttachment(
        images.map((item) => ({ ...item, attachment_type: "image" }))
      )

      return res.json(new ResponseData(toAttachmentListResponse(data), "Uploaded multiple image"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async uploadSingleImage(req: Express.Request, res: Express.Response) {
    try {
      if (!req.file) return res.json(new ResponseError("Missing file in form body"))

      const image = await UploadService.uploadSingleImage({
        file: req.file,
        folder: "message/image",
      })
      if (!image) return res.json(new ResponseError("Failed to upload image"))

      const data = await AttachmentService.createAttachment({ ...image, attachment_type: "image" })
      toAttachmentResponse(data)
      return res.json(new ResponseData(image, "uploaded single image"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async uploadSingleVideo(req: Express.Request, res: Express.Response) {
    try {
      if (!req.file) return res.json(new ResponseError("Missing video in form body"))

      const video = await UploadService.uploadSingleVideo({
        file: req.file,
        folder: "message/video",
      })
      if (!video) return res.json(new ResponseError("Failed to upload video"))

      const data = await AttachmentService.createAttachment({ ...video, attachment_type: "video" })

      return res.json(
        new ResponseData<AttachmentRes>(toAttachmentResponse(data), "uploaded single video")
      )
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async uploadMultipleVideo(req: Express.Request, res: Express.Response) {
    try {
      if (!req.files?.length) return res.json(new ResponseError("Missing video in form body"))

      const videos = await UploadService.uploadMultipleVideo({
        files: req.files as any,
        folder: "message/video",
      })
      if (!videos?.length) return res.json(new ResponseError("Failed to upload video"))

      const data = await AttachmentService.createMultipleAttachment(
        videos.map((item) => ({ ...item, attachment_type: "video" }))
      )

      return res.json(new ResponseData(toAttachmentListResponse(data), "uploaded multiple video"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }

  async deleteAttachment(req: Express.Request, res: Express.Response) {
    try {
      const status = await UploadService.deleteResource({
        public_id: req.attachment.public_id,
        resource_type: req.attachment.attachment_type,
      })

      await AttachmentService.deleteAttachment(req.attachment._id)
      if (!status) return res.json(new ResponseError("Failed to delete attachment"))

      return res.json(new ResponseData(null, "Deleted single attachment"))
    } catch (error) {
      return res.status(400).send(error)
    }
  }
}

export default new AttachmentController()
