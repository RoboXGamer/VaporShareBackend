import mongoose from "mongoose";
import {DB_NAME} from "../constant";

export async function connectDB () {
    try{
        const connectInstances = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DB connection successful, host: ${connectInstances.connection.host}`)
    }
    catch(error){
        console.log("DB connection failed!!", error)
        process.exit(1)
    }
}