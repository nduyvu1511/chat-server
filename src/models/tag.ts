import Mongoose, { Schema } from "mongoose"

const TagSchema = new Schema({
  text: { type: String, trim: true, required: true },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export default Mongoose.model("Tag", TagSchema)
