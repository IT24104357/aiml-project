

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const express = require("express");
const bcrypt = require("bcryptjs");

// ✅ ONLY ADD THESE
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// ================= REGISTER USER =================
router.post("/register", async (req,res)=>{

 try{

  if(req.body.role === "admin" || req.body.role === "kitchen"){
   return res.status(403).json("Not allowed to register this role");
  }

  

  const username = req.body.username;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(req.body.email)){
   return res.status(400).json("Invalid email format");
  }

  const phoneRegex = /^[0-9]{10}$/;
  if(!phoneRegex.test(req.body.phone)){
   return res.status(400).json("Phone number must contain exactly 10 digits");
  }

  const existingUser = await User.findOne({ username });
  if(existingUser){
   return res.status(400).json("IT Number already registered");
  }

  const existingEmail = await User.findOne({ email: req.body.email });
  if(existingEmail){
   return res.status(400).json("Email already registered");
  }

  const existingPhone = await User.findOne({ phone: req.body.phone });
  if(existingPhone){
   return res.status(400).json("Phone number already registered");
  }

  const hashedPassword = await bcrypt.hash(req.body.password,10);

  const newUser = new User({
   username: username,
   email: req.body.email,
   phone: req.body.phone,
   password: hashedPassword,
   role: req.body.role
  });

  const savedUser = await newUser.save();

  res.json(savedUser);

 }catch(err){
  console.log(err);
  res.status(500).json("Server error");
 }

});

// ================= LOGIN USER =================
router.post("/login", async (req, res) => {
  try {

    const user = await User.findOne({
      username: req.body.username
    });

    if (!user) {
      return res.status(400).json("User not found");
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

  const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
res.json({
  token,
  user
});
    

    

  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
});

// ================= FORGOT PASSWORD (ADDED) =================
router.post("/forgot-password", async (req, res) => {
 try {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
   return res.status(404).json("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
   user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS      
   }
  });

  await transporter.sendMail({
   to: user.email,
   subject: "Password Reset",
   html: `<a href="${resetLink}">Reset Password</a>`
  });

  res.json("Reset link sent to email");

 } catch (err) {
  console.log(err);
  res.status(500).json("Error sending email");
 }
});


// ================= RESET PASSWORD (ADDED) =================
router.post("/reset-password/:token", async (req, res) => {
 try {

  const user = await User.findOne({
   resetToken: req.params.token,
   resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
   return res.status(400).json("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.json("Password reset successful");

 } catch (err) {
  console.log(err);
  res.status(500).json("Error resetting password");
 }
});


module.exports = router;