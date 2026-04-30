const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

  userId:String,

  Day:String,
  Time:String,

  Food_Item:String,

  Food_Type:{
    type:String,
    enum:["Veg","NonVeg"],
    default:"Veg"
  },

  Food_SubType:String,

  Food_Category:{
    type:String,
    enum:["Fresh","Packed"],
    required:false
  },

  Weather:String,
  Price:Number,
  Previous_Sales:Number,

  Is_Friday:Number,
  Is_Weekend:Number,
  Is_Special_Day:Number,

  quantity:Number,

  status:{
    type:String,
    enum:["pending","preparing","ready","cancelled"],
    default:"pending"
  },

  orderDate:{
    type:Date,
    default:Date.now
  },

  orderNumber:{
    type:String,
    unique:true
  },

  username:String

});

module.exports = mongoose.model("Order", OrderSchema, "Order");