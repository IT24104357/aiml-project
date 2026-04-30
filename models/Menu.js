const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({

  Food_Item:String,

  Food_Type:{
    type:String,
    enum:["Veg","NonVeg"],
    default:"Veg"
  },

  Food_Category:{
    type:String,
    enum:["Fresh","Packed"],
    required:true
  },

  Food_SubType:{
    type:String,
    enum:["Meal","Snack","Dessert","Drink"],
    default:"Meal"
  },

  Price:Number,

  Day:String,
  Time:String,

  Weather:String,
  Previous_Sales:Number,

  Is_Friday:Number,
  Is_Weekend:Number,
  Is_Special_Day:Number,

  quantity:{
    type:Number,
    default:0
  },

  image:String,

  availability:{
    type:String,
    enum:["Available","Not Available"],
    default:"Available"
  }

});

module.exports = mongoose.model("Menu", MenuSchema, "menus");