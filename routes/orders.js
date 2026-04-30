
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware"); 

const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const Sales = require("../models/Sales");

router.use(protect);

// ==============================
// CREATE ORDER
// ==============================
router.post("/", async (req, res) => {

 try {

  console.log("REQUEST BODY:", req.body); // DEBUG

  const orderQty = Number(req.body.quantity);

  const menu = await Menu.findById(req.body.menuId);

  if (!menu) {
   return res.status(404).json("Menu item not found");
  }

  if (orderQty > menu.quantity) {
   return res.status(400).json("Not enough stock available");
  }

  // reduce stock
  menu.quantity -= orderQty;

  if (menu.quantity <= 0) {
   menu.quantity = 0;
   menu.availability = "Not Available";
  }

  await menu.save();

  const now = new Date();

  const realTime = now.toLocaleTimeString([], {
   hour: "2-digit",
   minute: "2-digit"
  });

  const realDay = now.toLocaleDateString("en-US", {
   weekday: "long"
  });

  let weatherOptions = ["Sunny", "Cloudy", "Rainy"];
  const realWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

  const previousSales = await Order.countDocuments({
 Food_Item: menu.Food_Item
});

  // ✅ GENERATE ORDER NUMBER
const count = await Order.countDocuments();
const orderNumber = "ORD-" + (count + 1).toString().padStart(4,"0");

// ✅ GET USER NAME
let username = "Unknown";
const user = await User.findById(req.body.userId);
if(user){
  username = user.username;
}

const isFriday = realDay === "Friday" ? 1 : 0;
const isWeekend =
  (realDay === "Saturday" || realDay === "Sunday") ? 1 : 0;

const isSpecialDay = isWeekend;

const newOrder = new Order({

  orderNumber, // ✅ NEW
  username,    // ✅ NEW

  userId: req.body.userId,

  Day: realDay,
  Time: realTime,
  Weather: realWeather,

  Food_Item: menu.Food_Item,
Food_Type: menu.Food_Type,
Food_Category: menu.Food_Category,
Food_SubType: menu.Food_SubType || "Meal",
Price: Number(menu.Price),

  Previous_Sales: previousSales,
  Is_Friday: isFriday,
Is_Weekend: isWeekend,
Is_Special_Day: isSpecialDay,

  quantity: Number(req.body.quantity),

  status: "pending"
});

  const savedOrder = await newOrder.save();

  res.json(savedOrder);

 } catch (err) {

  console.log("ORDER ERROR:", err);
  res.status(500).json(err.message);

 }

});


// ==============================
// GET USER ORDERS
// ==============================
router.get("/user/:userId", async (req, res) => {

 try {

  const orders = await Order.find({
   userId: req.params.userId
  }).sort({ orderDate: -1 });

  res.json(orders);

 } catch (err) {

  res.status(500).json(err);

 }

});


// ==============================
// GET ALL ORDERS (KITCHEN)
// ==============================
router.get("/", async (req, res) => {

 try {

  const orders = await Order.find().sort({ orderDate: -1 });

  res.json(orders);

 } catch (err) {

  res.status(500).json(err);

 }

});


// ==============================
// UPDATE STATUS
// ==============================
router.put("/:id", async (req, res) => {

 try {

  // 🔍 Get existing order first
  const order = await Order.findById(req.params.id);

  if (!order) {
   return res.status(404).json("Order not found");
  }

  // 🚨 Prevent duplicate sales entry
  const alreadyReady = order.status === "ready";

  // ✅ Update status
  order.status = req.body.status;

  await order.save();

  // 🎯 SAVE TO SALES ONLY WHEN STATUS BECOMES READY
  if (req.body.status === "ready" && !alreadyReady) {

    await Sales.create({
      Food_Item: order.Food_Item,
      Food_Type: order.Food_Type,
      quantity: order.quantity,
      totalPrice: order.Price * order.quantity,
      soldAt: new Date()
    });

  }

  res.json(order);

 } catch (err) {

  res.status(500).json(err);

 }

});



module.exports = router;