import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRoutes.js"
import blogRouter from "./routes/blogRoutes.js";
import fileUpload from "express-fileupload";

const app=express();
dotenv.config({path:"./config/config.env"});
app.use(cors({
    origin:[process.env.FRONT_END_URL],
    methods:["GET","PUT","POST","DELETE"],
    credentials:true
}))
//Whenever we want to access the cookie
//data then we need to use cookieParser from cookie-parser
app.use(cookieParser());
//For understanding json data by the express
app.use(express.json());
//url and form data understand by express
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))
app.use("/api/v1/user",userRouter);
app.use("/api/v1/blog",blogRouter);
dbConnection();

app.use(errorMiddleware);
export default app;