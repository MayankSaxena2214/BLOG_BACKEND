import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import ErrorHandler from "../middlewares/error.js";
import { Blog } from "../models/blogSchema.js";

export const blogPost=catchAsyncErrors(async (req,res,next)=>{
    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("Please upload the main image related to your blog",400));
    }
    const {mainImage,paraOneImage,paraTwoImage,paraThreeImage}=req.files;
    //Note only main Image is mandatory
    if(!mainImage){
        return next(new ErrorHandler("Please upload the main image in respective low size",400));
    }
    const allowedFormats=["image/png","image/jpeg","image/webp"];
    if(!allowedFormats.includes(mainImage.mimetype) ||
        (paraOneImage &&!allowedFormats.includes(paraOneImage.mimetype) ) ||
        (paraTwoImage &&!allowedFormats.includes(paraTwoImage.mimetype) ) ||
        (paraThreeImage &&!allowedFormats.includes(paraThreeImage.mimetype) )){
        return next(new ErrorHandler("Invalid image format , Allowed format is webp,jpeg and png",400));
    }
    const {title,
        intro,
        paraOneDescription,
        paraTwoDescription,
        paraThreeDescription,
        paraOneTitle,
        paraTwoTitle,
        paraThreeTitle,
        category,
        published
    }=req.body;
    const createdBy=req.user._id;
    const authorName=req.user.name;
    const authorAvatar=req.user.avatar.url;

    if(!title || !intro || !category){
        return next(new ErrorHandler("Note the Title intro and category field is mandatory",400));
    }
    const uploadPromises=[
        cloudinary.uploader.upload(mainImage.tempFilePath),
        paraOneImage?cloudinary.uploader.upload(paraOneImage.tempFilePath):Promise.resolve(null),
        paraTwoImage?cloudinary.uploader.upload(paraTwoImage.tempFilePath):Promise.resolve(null),
        paraThreeImage?cloudinary.uploader.upload(paraThreeImage.tempFilePath):Promise.resolve(null),
    ]
    //now get the response 
    const [mainImageResponse,paraOneImageResponse,paraTwoImageResponse,paraThreeImageResponse]=await Promise.all(uploadPromises);
    if(!mainImageResponse || mainImageResponse.error ||
        (paraOneImage && (!paraOneImageResponse || paraOneImageResponse.error)) ||
        (paraTwoImage && (!paraTwoImageResponse || paraTwoImageResponse.error)) ||
        (paraThreeImage && (!paraThreeImageResponse || paraThreeImageResponse.error))
    ){
        return next(new ErrorHandler("Some error occured in cloudinary upload",500));
    }
    const blogData={
        title,
        intro,
        paraOneDescription,
        paraTwoDescription,
        paraThreeDescription,
        paraOneTitle,
        paraTwoTitle,
        paraThreeTitle,
        category,
        published,
        createdBy,
        authorName,
        authorAvatar,
        mainImage:{
            public_id:mainImageResponse.public_id,
            url:mainImageResponse.secure_url
        }
    }
    if(paraOneImageResponse){
        blogData.paraOneImage={
            public_id:paraOneImageResponse.public_id,
            url:paraOneImageResponse.secure_url
        }
    }
    if(paraTwoImageResponse){
        blogData.paraTwoImage={
            public_id:paraTwoImageResponse.public_id,
            url:paraTwoImageResponse.secure_url
        }
    }
    if(paraThreeImageResponse){
        blogData.paraThreeImage={
            public_id:paraThreeImageResponse.public_id,
            url:paraThreeImageResponse.secure_url
        }
    }
    const blog=await Blog.create(blogData);
    res.status(200).json({
        success:true,
        message:"Blog Posted successfully",
        blog,
    })
});
export const deleteBlog=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const blog=await Blog.findOne({_id:id});
    if(!blog){
        return next(new ErrorHandler("Blog Does not exists",404));
    }
    await blog.deleteOne();
    res.status(200).json({
        success:true,
        message:"Blog Deleted Successfully"
    })
});
export const getAllBlogs=catchAsyncErrors(async(req,res,next)=>{
    const blogs=await Blog.find({published:true});
    if(!blogs){
        return next(new ErrorHandler("Sorry there are no blogs or some error happened",500));
    }
    res.status(200).json({
        success:true,
        message:"Blog Succesfully fetched",
        blogs
    })
})
export const getSingleBlog=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    if(!id){
        return next(new ErrorHandler("Id of blog is not supplied",400));
    }
    const blog=await Blog.findOne({_id:id});
    if(!blog){
        return next(new ErrorHandler("NO blog found with this id",404));
    }
    res.status(200).json({
        success:true,
        blog,
        message:"Blog fetched successfully"
    })
})
export const getMyBlogs=catchAsyncErrors(async(req,res,next)=>{
    if(req.user.role!=="Author"){
        return next(new ErrorHandler("You are not the author",400));
    }
    const authorId=req.user._id;
    const myBlogs=await Blog.find({createdBy:authorId});
    if(!myBlogs){
        return next(new ErrorHandler("You have no blogs",400));
    }
    res.status(200).json({
        success:true,
        message:"Your blogs fetched successfully",
        myBlogs
    })
});
export const updateBlog=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    let blog=await Blog.findOne({_id:id});
    if(!blog){
        return next(new ErrorHandler("Blog does not exist , you might deleted it",404));
    }
    const newBlogData={
        title:req.body.title,
        intro:req.body.intro,
        paraOneDescription:req.body.paraOneDescription,
        paraTwoDescription:req.body.paraTwoDescription,
        paraThreeDescription:req.body.paraThreeDescription,
        paraOneTitle:req.body.paraOneTitle,
        paraTwoTitle:req.body.paraTwoTitle,
        paraThreeTitle:req.body.paraThreeTitle,
        category:req.body.category,
        published:req.body.published,
    }
    if(req.files){
        const {
            paraOneImage,
            mainImage,
            paraTwoImage,
            paraThreeImage
        }=req.files;
        const allowedFormats=["image/webp","image/jpeg","image/png"];
        if((mainImage && !allowedFormats.includes(mainImage.mimetype)) || 
        (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) || 
        (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) ||
        (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))){
            return next(new ErrorHandler("Please upload the images into the webp,jpeg or png formats only",400));
        }
        if(req.files && mainImage){
            const oldMainImageId=blog.mainImage.public_id;
            await cloudinary.uploader.destroy(oldMainImageId);
            const newMainImageResponse=await cloudinary.uploader.upload(
                mainImage.tempFilePath
            )
            newBlogData.mainImage={
                public_id:newMainImageResponse.public_id,
                url:newMainImageResponse.secure_url,
            }
        }
        if(req.files && paraOneImage){
            if(blog.paraOneImage){
                const oldParaOneImageId=blog.paraOneImage.public_id;
                await cloudinary.uploader.destroy(
                    oldParaOneImageId
                )
            }
            const newParaOneImageResponse=await cloudinary.uploader.upload(
                paraOneImage.tempFilePath
            )
            newBlogData.paraOneImage={
                public_id:newParaOneImageResponse.public_id,
                url:newParaOneImageResponse.secure_url
            }
        }
        if(req.files && paraTwoImage){
            if(blog.paraTwoImage){
                const oldParaTwoImageId=blog.paraTwoImage.public_id;
                await cloudinary.uploader.destroy(
                    oldParaTwoImageId
                )
            }
            const newParaTwoImageResponse=await cloudinary.uploader.upload(
                paraTwoImage.tempFilePath
            )
            newBlogData.paraTwoImage={
                public_id:newParaTwoImageResponse.public_id,
                url:newParaTwoImageResponse.secure_url
            }
        }
        if(req.files && paraThreeImage){
            if(blog.paraThreeImage){
                const oldParaThreeImageId=blog.paraThreeImage.public_id;
                await cloudinary.uploader.destroy(
                    oldParaThreeImageId
                )
            }
            const newParaThreeImageResponse=await cloudinary.uploader.upload(
                paraThreeImage.tempFilePath
            )
            newBlogData.paraThreeImage={
                public_id:newParaThreeImageResponse.public_id,
                url:newParaThreeImageResponse.secure_url
            }
        }
    }
    blog=await Blog.findByIdAndUpdate(id,newBlogData,{
        new:true, // to get the updated in response
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        message:"Blog updated successfully",
        blog
    })
})