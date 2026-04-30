const protect = require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const axios = require("axios");

const Prediction = require("../models/Prediction");
const Order = require("../models/Order");

// store latest predictions
let lastPredictions = [];

router.use(protect);

// ==============================
// GET WEATHER
// ==============================
async function getWeather() {
  try {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather?q=Anuradhapura&appid=YOUR_API_KEY"
    );

    const weatherMain = res.data.weather[0].main;

    if (weatherMain.includes("Rain")) return "Rainy";
    if (weatherMain.includes("Cloud")) return "Cloudy";

    return "Sunny";

  } catch (err) {
    console.log("Weather fetch failed");
    return "Sunny";
  }
}

// ==============================
// GET PREDICTIONS
// ==============================
router.get("/", async (req, res) => {

  try {

    const currentWeather = await getWeather();

    const orders = await Order.find({ status: "ready" });

    console.log("ORDERS COUNT:", orders.length);

    let salesCount = {};

    orders.forEach(order => {
      if (!salesCount[order.Food_Item]) {
        salesCount[order.Food_Item] = 0;
      }

      salesCount[order.Food_Item] += order.quantity;
    });

    let formattedOrders = [];

    orders.forEach(order => {

      formattedOrders.push({
        Day: order.Day,
        Time: order.Time,
        Food_Item: order.Food_Item,

        Food_Category: order.Food_Category || "Fresh",
        Food_SubType: order.Food_SubType || "Meal",
        Food_Type: order.Food_Type || "Veg",

        Weather: currentWeather,

        Price: order.Price || 0,

        Previous_Sales: salesCount[order.Food_Item],

        Is_Friday: order.Is_Friday || 0,
        Is_Weekend: order.Is_Weekend || 0,
        Is_Special_Day: order.Is_Special_Day || 0
      });

    });

    console.log("FORMATTED:", formattedOrders.length);

    if (formattedOrders.length === 0) {
      return res.json([]);
    }

    const scriptPath = path.join(__dirname, "../../ai/predict.py");

    const python = spawn("python", [
      scriptPath,
      JSON.stringify(formattedOrders)
    ]);

    let result = "";

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (err) => {
      console.log("PYTHON ERROR:", err.toString());
    });

    python.on("close", async () => {

      let predictions = [];

      try {
        predictions = JSON.parse(result);
      } catch (e) {
        console.log("JSON PARSE ERROR:", result);
        return res.json([]);
      }

      console.log("PREDICTIONS:", predictions);

      if (predictions.length === 0) {
        console.log("NO PREDICTIONS GENERATED");
        return res.json([]);
      }

      const today = new Date();
today.setHours(0,0,0,0);

// delete today + future old predictions
await Prediction.deleteMany({
  targetDate: { $gte: today }
});

for (let item of predictions) {

  const sample = formattedOrders.find(
    o => o.Food_Item === item.food
  );

  if (!sample) continue;

  const forecastDays = [
    item.prediction.Day1,
    item.prediction.Day2,
    item.prediction.Day3
  ];

  for (let i = 0; i < 3; i++) {

    const target = new Date(today);
    target.setDate(today.getDate() + i);

    const pred = new Prediction({
      Food_Item: item.food,
      Food_Category: sample.Food_Category,
      Food_Type: sample.Food_Type,
      Food_SubType: sample.Food_SubType,

      predicted_quantity: forecastDays[i],

      Day: target.toLocaleDateString("en-US", {
        weekday: "long"
      }),

      Time: sample.Time,
      Weather: sample.Weather,

      targetDate: target
    });

    await pred.save();
  }

  console.log("Saved:", item.food);
}

      lastPredictions = predictions;

      res.json(predictions);

    });

  } catch (err) {

    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });

  }

});

// ==============================
// GET LATEST PREDICTIONS
// ==============================
router.get("/latest", (req, res) => {
  res.json(lastPredictions);
});

// ==============================
// GET PREDICTION HISTORY
// ==============================
router.get("/history", async (req, res) => {

  try {

    const { date } = req.query;

    let filter = {};

    if (date) {

      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      filter.created_at = {
        $gte: start,
        $lt: end
      };
    }

    const data = await Prediction.find(filter);

    res.json(data);

  } catch (err) {

    res.status(500).json(err);

  }

});

module.exports = router;