import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
//Note sometimes we write the curly but sometimes not?
//If you have write the export default then no curly required, else 
//you need to write the name of specific module you are importing
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary"
//for register
export const register=catchAsyncErrors(async (req,res,next)=>{

    if(!req.files || Object.keys(req.files).length===0){
      return next(new ErrorHandler("User avatar profile image is needed",400));
    }
    const {avatar}=req.files;
    const allowedFormats=["image/png","image/jpeg","image/webp"];
    //avatar.mimetype is used to get the extension of the image
    if(!allowedFormats.includes(avatar.mimetype)){
      return next(new ErrorHandler("Please upload image of type jpeg,png,or webp format",400));
    }

 
    const {email,name,password,role,phone,education}=req.body;
    //check if the empty
    if(!email || !name || !password || !role || !phone || !education || !avatar){
        return next(new ErrorHandler("Please write all details"),404);
    }
    //now try to fetch to verify whether present or not
    let user=await User.findOne({email:email});
    if(user){
        return next(new ErrorHandler("User already exists"),404);
    }

    let cloudinaryResponse=await cloudinary.uploader.upload(
      avatar.tempFilePath
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
      console.error("Cloudinary Error",cloudinaryResponse.error || "Unknown cloudinary Error")
    }
    user=await User.create({
        email,
        name,
        password,
        role,
        phone,
        education,
        avatar:{
          public_id:cloudinaryResponse.public_id,
          url:cloudinaryResponse.secure_url
        }
    })
    sendToken(user,200,"User Registered Successfully",res);
})
export const login=catchAsyncErrors(async(req,res,next)=>{
    let {role,email,password}=req.body;
    if(!role || !email || !password){
        //400 for bad request and 404 for not found request
        return next(new ErrorHandler("Please enter all the fields"),400)
    }
    let user=await User.findOne({email:email}).select("+password");
    if(!user){
        return next(new ErrorHandler("User does not exists"),400);
    }
   
    //check for the password
    //we have defined the comparePassword into the schema so that 
    //every entity of userschema can use this to compare its password 
    //with the supplied password as argument
    const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided role(${role}) not found`, 400)
    );
  }
  sendToken(user,200,"User Login Successfully",res);
})
export const logout=(req,res,next)=>{
  res.status(200).cookie("token","",{
    expires:new Date(Date.now()),
    httpOnly:true,
    secure:true,
    sameSite:"None",
  }).json({
    success:true,
    message:"User Logged out successfully"
  })
}
export const getMyProfile=(req,res,next)=>{
  const user=req.user;
  res.status(200).json({
    success:true,
    user
  })
}
export const getAllAuthors=async(req,res,next)=>{
  const authors=await User.find({role:"Author"});
  res.status(200).json({
    success:true,
    authors
  })
}