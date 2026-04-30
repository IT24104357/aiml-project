const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  foodName: String,
  date: String,
  quantitySold: Number
});

// IMPORTANT: use lowercase collection name
module.exports = mongoose.model("sales", SaleSchema);