import ErrorHandler from "../middlewares/error.js"
export const sendToken=(user,statusCode,message,res)=>{
    const token=user.getJWTToken();
    if(!token){
        return next(new ErrorHandler("Something went wrong inside jwtToken File"));
    }
    const options={
        expires:new Date(Date.now() + process.env.COOKIE_EXPIRES *24*60*60*1000),
        httpOnly:true,
        //EXTRA
        secure:true,
        sameSite:"None",
    }
    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        message,
        user,
        token,
    });
}