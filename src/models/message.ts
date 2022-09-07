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
    type: {
      lng: String,
      lat: String,
    },
    default: null,
  },
  attachments: [
    {
      attachment_id: { type: Schema.Types.ObjectId, ref: "Attachment" },
      is_deleted: Boolean,
      is_hidden: Boolean,
      default: [],
    },
  ],
  reply_to: {
    type: {
      message_id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      attachment_id: {
        type: Schema.Types.ObjectId,
        ref: "Attachment",
        required: false,
      },
    },
    default: null,
  },
  read_by_user_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  liked_by_user_ids: [
    {
      type: {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        emotion: {
          type: String,
          enum: ["like", "angry", "sad", "laugh", "heart", "wow"],
        },
      },
      default: [],
    },
    {
      _id: false,
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
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export default Mongoose.model("Message", MessageSchema)
