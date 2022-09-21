import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "cloudinary"
import multer, { Multer } from "multer"
import dotenv from "dotenv"
dotenv.config()

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    public_id: () => "messages",
  },

  // allowedFormats: ["jpg", "png"],
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname)
  // },
})

const uploadCloud = multer({ storage })

export default uploadCloud
