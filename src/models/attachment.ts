import Mongoose, { Schema } from "mongoose"
import { IAttachment } from "../types"

const AttachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true, trim: true },
  thumbnail_url: { type: String },
  attachment_type: {
    type: String,
    enum: ["image", "video"],
    trim: true,
    lowercase: true,
    required: true,
  },
  public_id: { type: String, required: true },
  asset_id: { type: String, required: true },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export default Mongoose.model("Attachment", AttachmentSchema)
