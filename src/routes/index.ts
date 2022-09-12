import Express from "express"
import attachmentRoute from "./attachmentRoute"
import messageRoute from "./messageRoute"
import roomRoute from "./roomRoute"
import tagRoute from "./tagRoute"
import userRoute from "./userRoute"

const route = (app: Express.Router) => {
  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/room", roomRoute)
  app.use("/api/v1/message", messageRoute)
  app.use("/api/v1/tag", tagRoute)
  app.use("/api/v1/attachment", attachmentRoute)
}

export default route
