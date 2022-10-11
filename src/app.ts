import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { createServer } from "http"
import morgan from "morgan"
import { Server } from "socket.io"
import db from "./config/db"
import log from "./config/logger"
import socketHandler from "./config/socket"
import swaggerDocs from "./config/swagger"
import routes from "./routes"

import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

app.use(cookieParser())

// app.use(morgan("combined"))

app.use(express.urlencoded({ extended: true }))

app.use(express.json({ limit: "10mb" }))

const corsConfig = {
  origin: true,
  Credential: true,
}
app.use(cors(corsConfig))

app.listen(PORT, () => {
  log.info(`App listening at port ${PORT}`)
  db.connect()
  swaggerDocs(app, Number(PORT))
  routes(app)
})

// Socket io
const httpServer = createServer(app)
httpServer.listen(process.env.CHAT_SOCKET_PORT, () => {
  log.info(`App listening at port ${PORT}`)
})
export const socket = new Server(httpServer, {
  cors: corsConfig,
})
socketHandler(socket)
