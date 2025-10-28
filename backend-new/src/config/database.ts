import mongoose from "mongoose";

export async function connectDB() {
    const connect = await mongoose.connect(process.env.DB!)
    console.log(`database running on: ${connect.connection.host}`)

    
}