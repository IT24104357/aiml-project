const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

 username:{
  type:String,
  required:true,
  unique:true
 },

 email:{
  type:String,
  required:true,
  unique:true
 },

 phone:{
  type:String,
  required:true
 },

 password:{
  type:String,
  required:true
 },

 role:{
  type:String,
  enum:["admin","kitchen","lecturer","student"],
  required:true
 },

    resetToken: String,
 resetTokenExpire: Date

});

module.exports = mongoose.model("User",UserSchema);