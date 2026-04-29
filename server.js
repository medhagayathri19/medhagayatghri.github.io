import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import cron from "node-cron";

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/alumni_tracking")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const userSchema = new mongoose.Schema({

reg_no:String,
name:String,
phone:String,
email:String,
address:String,
status:String,
company:String,
job_role:String,
password:String

});

const User = mongoose.model("User",userSchema);

let otpStore = {};

app.post("/api/auth/login",async(req,res)=>{

const {reg_no,password}=req.body;

const user = await User.findOne({reg_no});

if(!user){
return res.json({success:false,message:"User not found"});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.json({success:false,message:"Invalid password"});
}

res.json({success:true,user});

});

app.get("/api/profile/:regno",async(req,res)=>{

const user = await User.findOne({reg_no:req.params.regno});

res.json(user);

});

app.put("/api/profile/update",async(req,res)=>{

const {reg_no,company,job_role}=req.body;

await User.updateOne(
{reg_no},
{
company,
job_role
}
);

res.json({success:true});

});

app.get("/api/users",async(req,res)=>{

const users = await User.find();

res.json(users);

});

app.post("/api/send-otp",async(req,res)=>{

const {reg_no}=req.body;

const user = await User.findOne({reg_no});

if(!user){
return res.json({success:false});
}

const otp = Math.floor(100000+Math.random()*900000);

otpStore[reg_no]=otp;

console.log("OTP:",otp);

res.json({success:true});

});

app.post("/api/reset-password",async(req,res)=>{

const {reg_no,otp,newPassword}=req.body;

if(otpStore[reg_no]!=otp){
return res.json({success:false,message:"Invalid OTP"});
}

const hash = await bcrypt.hash(newPassword,10);

await User.updateOne(
{reg_no},
{password:hash}
);

delete otpStore[reg_no];

res.json({success:true});

});

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:"yourgmail@gmail.com",
pass:"yourapppassword"
}

});

cron.schedule("0 0 1 */6 *",async()=>{

console.log("Sending reminder emails");

const users = await User.find();

users.forEach(user=>{

transporter.sendMail({

from:"yourgmail@gmail.com",
to:user.email,
subject:"Alumni Update Reminder",
text:"Please login and update your company/job role."

});

});

});

app.listen(5000,()=>{
console.log("Alumni Tracking API is running...");
});