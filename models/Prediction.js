const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({

  Food_Item: String,
  Food_Category: String,
  Food_Type: String,
  Food_SubType: String,

  predicted_quantity: Number,

  Day: String,
  Time: String,
  Weather: String,

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Prediction", PredictionSchema);