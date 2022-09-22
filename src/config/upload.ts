import multer from "multer"
import path from "path"

export const uploadVideo = multer({
  storage: multer.diskStorage({}),
  limits: { files: 10 },
  fileFilter(req, file, callback) {
    let ext = path.extname(file.originalname)
    if (
      ext !== ".auto" &&
      ext !== ".flv" &&
      ext !== ".m3u8" &&
      ext !== ".ts" &&
      ext !== ".mov" &&
      ext !== ".mkv" &&
      ext !== ".mp4" &&
      ext !== ".mpd" &&
      ext !== ".ogv" &&
      ext !== ".webm"
    ) {
      callback(new Error("Unsupported file type!"))
      return
    }
    callback(null, true)
  },
})

export const uploadImage = multer({
  storage: multer.diskStorage({}),
  limits: { files: 20 },
  fileFilter(req, file, callback) {
    let ext = path.extname(file.originalname)
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      callback(new Error("Unsupported file type!"))
      return
    }
    callback(null, true)
  },
})
