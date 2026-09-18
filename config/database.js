import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

 const connectDB = async ()=>{
    try{
        const DB =  await mongoose.connect(MONGO_URI)
            console.log("MongoDB Connected Successfully!", DB.connection.host);

    }catch(error){
        console.log("MongoDB Connection Error: ", error.message);
        process.exit(1);
    }
}

export default connectDB;