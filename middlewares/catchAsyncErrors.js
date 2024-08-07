//This is also a middleware which handles the asyncronous error
//which might not be handled by us
//This is a function in which the function is received as an argument
//which is related to the asynchronous work
export const catchAsyncErrors = (theFunction) => {
    return (req, res, next) => {
      Promise.resolve(theFunction(req, res, next)).catch(next);
    };
  };