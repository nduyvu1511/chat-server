import Express from "express"
import messageRoute from "./messageRoute"
import roomRoute from "./roomRoute"
import userRoute from "./userRoute"

const route = (app: Express.Router) => {
  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/room", roomRoute)
  app.use("/api/v1/message", messageRoute)
}

export default route
