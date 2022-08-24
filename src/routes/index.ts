import Express from "express"
import userRoute from "./userRoute"

const route = (app: Express.Router) => {
  app.use("/api/user", userRoute)
}

export default route
