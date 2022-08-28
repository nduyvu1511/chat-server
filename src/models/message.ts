import Mongoose, { Schema } from "mongoose"
import { IMessage } from "../types"

const MessageSchema = new Schema<IMessage>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  room_id: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  text: {
    type: String,
    trim: true,
    default: null,
  },
  tag_ids: [{ type: String, ref: "Tag", default: [] }],
  location: {
    lng: String,
    lat: String,
    default: null,
  },
  attachments: [
    {
      attachment_id: {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
      },
      url: {
        type: String,
        trim: true,
        // match: [URL_REGEX, "Invalid url"],
      },
      is_deleted: Boolean,
      is_hidden: Boolean,
      created_at: {
        type: Number,
        default: Date.now,
      },
      default: [],
    },
  ],
  reply_to: {
    message_id: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    attachment_id: {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
      required: false,
      default: null,
    },
    default: null,
  },
  read_by_user_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      default: [],
    },
  ],
  is_hidden: {
    type: Boolean,
    default: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_edited: {
    type: Boolean,
    default: false,
  },
  liked_by_member_ids: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      emotion: {
        type: String,
        enum: ["like", "angry", "sad", "laugh", "heart", "wow"],
      },
      default: [],
    },
  ],
  created_at: {
    type: Number,
    default: Date.now,
  },
  updated_at: {
    type: Number,
    default: Date.now,
  },
})

export default Mongoose.model("Message", MessageSchema)
