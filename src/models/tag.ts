import Mongoose, { Schema } from "mongoose"

const TagSchema = new Schema({
  text: { type: String, trim: true, required: true },
})

export default Mongoose.model("Tag", TagSchema)
