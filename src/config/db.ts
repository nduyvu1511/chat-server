import mongoose from "mongoose"
import log from "./logger"

const connect = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions
    )
    log.info("DB connected")
  } catch (error) {
    console.log(error)
    log.error("Could not connect to db")
    // process.exit(1)
  }
}

export default { connect }
