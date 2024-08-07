import app from "./app.js";
import cloudinary from "cloudinary"
// API_KEY=367626484831748
// API_SECRET=Xxi1tlDS3WfmU5e97Ob81HxGKWA
// CLOUD_NAME= dbzvnimt6
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`);
})