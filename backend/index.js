import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());

//Routes
app.use("/api/v1",userRoutes);


app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is runing on ${PORT}`);
});
