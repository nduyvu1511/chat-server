import _cloudinary from "../config/cloudinary"
import log from "../config/logger"
import {
  DeleteResource,
  UploadMultipleImage,
  UploadMultipleVideo,
  UploadSingleImage,
  UploadSingleVideo,
} from "../types"
const cloudinary = _cloudinary.v2

export type UploadApiResponse = _cloudinary.UploadApiResponse

export interface UploadResourceRes {
  url: string
  thumbnail_url: string
  public_id: string
  asset_id: string
}

class UploadService {
  async uploadSingleImage(params: UploadSingleImage): Promise<UploadResourceRes | null> {
    const { file, folder, heightThumbnail = 320, widthThumbnail = 320 } = params
    try {
      const res = await cloudinary.uploader.upload(file.path, {
        eager: [
          {
            quality: "auto",
          },
          {
            crop: "fill",
            quality: "auto",
            width: widthThumbnail,
            height: heightThumbnail,
          },
        ],
        folder,
      })
      if (!res?.public_id) return null

      return {
        asset_id: res?.asset_id || res.public_id,
        public_id: res.public_id,
        url: res?.eager[0]?.secure_url || res.secure_url,
        thumbnail_url: res?.eager[1]?.secure_url || res.secure_url,
      }
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async uploadSingleVideo(params: UploadSingleVideo): Promise<UploadResourceRes | null> {
    const { file, folder, heightThumbnail = 320, widthThumbnail = 320 } = params
    try {
      const res = await cloudinary.uploader.upload(file.path, {
        eager: [
          {
            quality: "auto",
          },
          {
            quality: 30,
            transformation: {
              crop: "fill",
              quality: "auto",
              width: widthThumbnail,
              height: heightThumbnail,
            },
          },
        ],
        folder,
        resource_type: "video",
        eager_async: true,
        eager_notification_url: "http://localhost:3000/",
        notification_url: "http://localhost:3000/",
      })
      if (!res?.public_id) return null

      return {
        asset_id: res?.asset_id || res.public_id,
        public_id: res.public_id,
        url: res?.eager[0]?.secure_url || res.secure_url,
        thumbnail_url: res?.eager[1]?.secure_url || res.secure_url,
      }
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async uploadMultipleVideo(params: UploadMultipleVideo): Promise<UploadResourceRes[]> {
    const { files, folder } = params
    try {
      const res = await Promise.all(
        files.map(async (item) => {
          return this.uploadSingleVideo({ folder, file: item })
        })
      )

      return res.filter((item) => item?.url) as any
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async uploadMultipleImage(params: UploadMultipleImage): Promise<UploadResourceRes[]> {
    const { files, folder, heightThumbnail = 320, widthThumbnail = 320 } = params
    try {
      const res = await Promise.all(
        files.map(async (item) => {
          return this.uploadSingleImage({ heightThumbnail, widthThumbnail, folder, file: item })
        })
      )

      return res.filter((item) => item) as any
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async deleteResource({ public_id, resource_type }: DeleteResource): Promise<boolean> {
    try {
      return !!(await cloudinary.uploader.destroy(public_id, { resource_type }))
    } catch (error) {
      log.error(error)
      return false
    }
  }
}

export default new UploadService()
