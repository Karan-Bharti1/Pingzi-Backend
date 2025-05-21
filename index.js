const express=require("express")
const mongoose=require("mongoose")
const Messages=require("./models/Messages")
const PingUser=require("./models/User")
const cors=require("cors")
const dotenv=require("dotenv")
const http=require('http')
const authRoutes=require("./routes/auth")
const {Server}=require("socket.io")
dotenv.config()
const app=express()
const server=http.createServer(app)
const io=new Server(server,{cors:{
    origin:"http://localhost:3000"
}})
app.use(cors())
app.use(express.json())
mongoose.connect(process.env.MONGODB).then(()=>console.log("Database connected successfully")).catch(error=>console.error(error))

app.use("/auth",authRoutes);
const PORT=process.env.PORT||5000
io.on("connection",socket=>{
    console.log("User Connected",socket.id)
    socket.on("send_message",async(data)=>{
        const {sender,receiver,message}=data
        const newMessage=new Messages({sender,receiver,message})
        await newMessage.save()
            socket.broadcast.emit("receive_message",data)
    })

socket.on("disconnect",()=>{
    console.log("User Disconnected",socket.id)
})
})
app.get("/messages",async(req,res)=>{
    const {sender,receiver}=req.query;
    try {
       const messages=await Messages.find({
        $or:[
            {sender,receiver},
            {sender:receiver,receiver:sender}
        ]
       }).sort({createdAt:1})
       res.json(messages)
    } catch (error) {
   res.status(500).json({message:"Error fetching messages"})     
    }
})
app.get("/users",async(req,res)=>{
    const {currentUser}=req.query
    try {
      const users=await PingUser.find({username:{ne:currentUser}})  
      res.json(users)

    } catch (error) {
        res.status(500).json({message:"Error while fetching users"})
    }
})
app.listen(PORT,()=>{
    console.log("App is running on the PORT: "+PORT)
})