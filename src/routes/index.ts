import Express from "express"
import attachmentRoute from "./attachmentRoute"
import messageRoute from "./messageRoute"
import roomRoute from "./roomRoute"
import tagRoute from "./tagRoute"
import userRoute from "./userRoute"

const route = (app: Express.Router) => {
  app.use("/api/user", userRoute)
  app.use("/api/room", roomRoute)
  app.use("/api/message", messageRoute)
  app.use("/api/tag", tagRoute)
  app.use("/api/attachment", attachmentRoute)
}

export default route
