import Mongoose, { Schema } from "mongoose"

const TagSchema = new Schema({
  text: { type: String, trim: true, required: true },
  role: {
    type: String,
    enum: ["customer", "car_driver", "admin"],
    required: true,
  },
  updated_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  created_at: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export default Mongoose.model("Tag", TagSchema)
