class ErrorHandler extends Error{
    //In Error standard class we only have the message
    //but we want to sent the status code also so 
    // we are creating our own class
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
    }
}
//note - Use this errorMiddleware at the very end of the app.js
export const errorMiddleware=(err,req,res,next)=>{
    err.message=err.message || "Internal Server Error";
    err.statusCode=err.statusCode || 500;

    if(err.name==="CastError"){
//cast error occurs when the schema restrictions is 
//not followed or the connection is not able to establish
//due ot internet connection
        const message=`Invalid Resource not found ${err.path}`;
        err=new ErrorHandler(message,404);
    }
    return res.status(err.statusCode).json({
        success:false,
        message:err.message,
    })
}
export default ErrorHandler;