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

export interface UploadImageRes {
  original: UploadApiResponse
  thumbnail: UploadApiResponse
}

class UploadService {
  async uploadSingleImage(params: UploadSingleImage): Promise<UploadImageRes | null> {
    const { file, folder, heightThumbnail = 320, widthThumbnail = 320 } = params
    try {
      const res = await Promise.all(
        [
          cloudinary.uploader.upload(file.path, {
            folder,
          }),
          cloudinary.uploader.upload(file.path, {
            folder,
            transformation: {
              crop: "fill",
              width: widthThumbnail,
              height: heightThumbnail,
            },
          }),
        ].map(async (item) => {
          return await item
        })
      )

      return { original: res[0], thumbnail: res[1] }
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async uploadSingleVideo(params: UploadSingleVideo): Promise<UploadApiResponse | null> {
    const { file, folder } = params
    try {
      return await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "video",
      })
    } catch (error) {
      log.error(error)
      return null
    }
  }

  async uploadMultipleVideo(params: UploadMultipleVideo): Promise<UploadApiResponse[]> {
    const { files, folder } = params
    try {
      const res = await Promise.all(
        files.map(async (item) => {
          return this.uploadSingleVideo({ folder, file: item })
        })
      )
      console.log("res: ", res)
      return res.filter((item) => item?.secure_url) as any
    } catch (error) {
      log.error(error)
      return []
    }
  }

  async uploadMultipleImage(params: UploadMultipleImage): Promise<UploadImageRes[]> {
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

  async deleteResource({ resource_ids, resource_type }: DeleteResource): Promise<boolean> {
    try {
      await Promise.all(
        resource_ids.map(async (item) => {
          console.log("cloudinary: ", item)
          return await cloudinary.uploader.destroy(item, { resource_type })
        })
      )

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  }

  // async deleteMultipleResource(cloudinaryIds: string[][]): Promise<boolean> {
  //   try {
  //     await Promise.all(
  //       cloudinaryIds.map(async (item) => {
  //         return await this.deleteResource({})
  //       })
  //     )
  //     return true
  //   } catch (error) {
  //     log.error(error)
  //     return false
  //   }
  // }
}

export default new UploadService()
