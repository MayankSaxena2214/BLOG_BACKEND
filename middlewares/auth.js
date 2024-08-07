import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js"
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken"
export const isAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    const token=req.cookies.token;
    // or const {token}=req.cookies;
    if(!token){
        return next(new ErrorHandler("User is not authenticated",400));
    }
    //token exists it means the user login cookie is not expired yet
    //fetch the data stored in cookie in the form of token
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
    //save the user in req.user
    req.user=await User.findOne({_id:decoded.id});
    next();
})
export const isAuthorized = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `User with this role ${req.user.role} not allowed to access this resource`
          )
        );
      }
      next();
    };
};