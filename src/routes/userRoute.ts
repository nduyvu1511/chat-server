import express from "express"
import { bodyMiddleware } from "../middlewares"
import { createUserSchema } from "../validators"
const router = express.Router()

router.post("/create_user", bodyMiddleware(createUserSchema))

export default router
