const express=require("express")
    const bcrypt=require("bcrypt" )
const jwt=require("jsonwebtoken")
const PingUser=require("../models/User")
const dotenv=require("dotenv")
const router=express.Router()
dotenv.config()
const JWT_SECRET=process.env.JWT_SECRET

router.post("/register",async(req,res)=>{
    const {username,password}=req.body
    try {
        const existingUser=await PingUser.findOne({username})
        if(existingUser){
            return res.status(400).json({message:"User Already Exists. Please Login"})

        }
        const salt= await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)
        const user=new PingUser({username:username,password:hashedPassword})
        await user.save()
        const token= jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"24h"})
        console.log(token)
        res.status(201).json({token,username,message:"User registered Successfully"})
    } catch (error) {
    res.status(500).json({message:"Server Error",error:error})
    }
})
router.post("/login",async(req,res)=>{
        const {username,password}=req.body
    try {
        const user=await PingUser.findOne({username})
        if(!user){
            res.status(404).json({message:"User Not Found"})
        }
        const isPasswordMatch=await user.comparePassword(password);
        if(!isPasswordMatch)return res.status(400).json({message:"Invalid Credentials"})
            res.status(200).json({message:"Login Successfull",username:user.username})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server Error While Login",error:error})
    }
})
module.exports=router;