// models/Sales.js

const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({

 orderId: String,

 Food_Item: String,
 Food_Category: String,
 Food_Type: String,
 Food_SubType: String,

 quantity: Number,
 totalPrice: Number,

 soldAt: {
  type: Date,
  default: Date.now
 }

});

module.exports = mongoose.model("Sales", SalesSchema);