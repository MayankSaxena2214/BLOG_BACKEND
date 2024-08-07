import mongoose from "mongoose";

export const dbConnection=()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"MERN_BLOG"
    })
    .then(()=>{
        console.log("Connected to databse");
    })
    .catch((err)=>{
        console.log(`Some error occured while connecting to the database . ${err}`);
    })
}