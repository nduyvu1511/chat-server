import Mongoose, { Schema } from "mongoose"

const AttachmentSchema = new Schema({
  url: { type: String, required: true, trim: true },
  thumbnail_url: { type: String, required: true },
  desc: { type: String, required: false, default: null },
  attachment_type: {
    type: String,
    enum: ["image", "video", "voice"],
    trim: true,
    lowercase: true,
    required: true,
  },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export default Mongoose.model("Attachment", AttachmentSchema)
