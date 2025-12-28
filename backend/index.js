import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user.js";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from 'cors';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

const app = express();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true,
  exposedHeaders: ["X-CSRF-Token"],//needed to expose header in frontend 
  methods:["GET","POST","PUT","DELETE","OPTIONS"]
}));

//Routes
app.use("/api/v1", userRoutes);

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is runing on ${PORT}`);
});
