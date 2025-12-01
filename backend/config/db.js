import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{dbName:"MERNAuth"});
        console.log("Mongo DB connected");
    } catch (error) {
        console.log("Failed to connect db");
    }
}

export default connectDb;