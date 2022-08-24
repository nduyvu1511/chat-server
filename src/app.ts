import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import path from "path"
import db from "./config"
import route from "./routes"

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({ limit: "10mb" }))

db.connect()

app.use(morgan("combined"))

const corsConfig = {
  origin: true,
  Credential: true,
}

app.use(cors(corsConfig))

route(app)

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`)
})
