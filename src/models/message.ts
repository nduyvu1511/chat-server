import Mongoose, { Schema } from "mongoose"

const MessageSchema = new Schema({
  user_id: { type: Number, ref: "User", required: true },
  group_id: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  text: {
    type: String,
    trim: true,
    default: undefined,
  },
  tag_ids: [{ type: String, ref: "Tag", default: [] }],
  location: {
    type: {
      lng: String,
      lat: String,
    },
    default: undefined,
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
      type: Number,
      ref: "User",
    },
    attachment_id: {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
      required: false,
      default: undefined,
    },
    default: undefined,
  },
  read_by_user_ids: [
    {
      type: Number,
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
        type: Number,
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
