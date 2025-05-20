const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const PingUserSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const PingUser=mongoose.model("PingUser",PingUserSchema)
module.exports=PingUser