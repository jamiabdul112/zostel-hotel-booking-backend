import express from "express"
import dotenv from "dotenv"
import connectDB from "./DB/connectionDB.js";
import cors from "cors";
import cookieParser from "cookie-parser"
import authRoute from "./routes/auth.route.js"
import roomRoute from "./routes/room.route.js"
import orderRoute from "./routes/order.route.js"
import cloudinary from "cloudinary"


dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
})

const app = express()

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))



const PORT = process.env.PORT

app.use("/api/auth", authRoute)
app.use("/api/room", roomRoute)
app.use("/api/order", orderRoute)

app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`)
    connectDB()
})