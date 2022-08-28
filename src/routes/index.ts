import Express from "express"
import userRoute from "./userRoute"
import roomRoute from "./roomRoute"

const route = (app: Express.Router) => {
  app.use("/api/v1/user", userRoute)
  app.use("/api/v1/room", roomRoute)
}

export default route
