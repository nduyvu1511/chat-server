import Express from "express"
import messageRoute from "./messageRoute"
import roomRoute from "./roomRoute"
import userRoute from "./userRoute"
import tagRoute from "./tagRoute"

const route = (app: Express.Router) => {
  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/room", roomRoute)
  app.use("/api/v1/message", messageRoute)
  app.use("/api/v1/tag", tagRoute)
}

export default route
