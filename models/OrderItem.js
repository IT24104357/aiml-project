// models/OrderItem.js

const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({

 orderId: String,
 menuId: String,

 Food_Item: String,
 Food_Category: String,
 Food_Type: String,
 Food_SubType: String,

 quantity: Number,
 price: Number

});

module.exports = mongoose.model("OrderItem", OrderItemSchema);