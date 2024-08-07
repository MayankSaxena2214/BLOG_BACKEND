import mongoose from "mongoose";
import { User } from "./userSchema.js";

const blogSchema=mongoose.Schema({
    title:{
        type:String,
        required:true,
        minLength:[8,"Blog title should contain at least 8 characters"],
        maxLength:[40,"Blog title can't exceed 40 characters"],
    },
    mainImage:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    intro:{
        type:String,
        required:true,
        minLength:[50,"Blog intro should contain at least 50 characters"],
    },
    paraOneImage:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    paraOneDescription:{
        type:String,
        minLength:[50,"Blog content should contain at least 50 characters"],
    },
    paraOneTitle:{
        type:String,
        minLength:[8,"Blog title should contain at least 8 characters"],
    },
    paraTwoImage:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    paraTwoDescription:{
        type:String,
        minLength:[50,"Blog content should contain at least 50 characters"],
    },
    paraTwoTitle:{
        type:String,
        minLength:[8,"Blog title should contain at least 8 characters"],
    },
    paraThreeImage:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    paraThreeDescription:{
        type:String,
        minLength:[50,"Blog content should contain at least 50 characters"],
    },
    paraThreeTitle:{
        type:String,
        minLength:[8,"Blog title should contain at least 8 characters"],
    },
    category:{
        type:String,
        required:true,
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    authorName:{
        type:String,
        required:true,
    },
    authorAvatar:{
        type:String,  //string will contain the url of the image 
        required:true,
    },
    published:{
        type:Boolean,
        default:false
    }
})
export const Blog=mongoose.model("Blog",blogSchema);