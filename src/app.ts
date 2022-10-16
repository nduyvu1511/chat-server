import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import { Server } from "socket.io"
import db from "./config/db"
import log from "./config/logger"
import socketHandler from "./config/socket"
import swaggerDocs from "./config/swagger"
import routes from "./routes"
dotenv.config()

const corsConfig = {
  origin: true,
  Credential: true,
}

const PORT = process.env.PORT || 5000
const app = express()

app.use(cookieParser())
app.use(morgan("combined"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "10mb" }))
app.use(cors(corsConfig))

// Socket io
const httpServer = app.listen(PORT, () => {
  db.connect()
  swaggerDocs(app, Number(PORT))
  routes(app)
  log.info(`App listening at port ${PORT}`)
  log.info(`Socket listening at port ${PORT}`)
})

export const socket = new Server(httpServer, { cors: corsConfig })
socketHandler(socket)
