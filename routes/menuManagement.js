const router = require("express").Router();
const Menu = require("../models/Menu");
const Order = require("../models/Order");
const axios = require("axios");

const { exec } = require("child_process");
const path = require("path");


/* FUNCTION TO RETRAIN AI MODEL */

function retrainAI(){

  const scriptPath = path.join(__dirname,"../../ai/train_model.py");

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {

    if(error){
      console.log("AI Training Error:", error);
      return;
    }

    console.log("AI retraining completed");
    console.log(stdout);

  });

}


/* GET ALL MENU ITEMS */

router.get("/", async (req,res)=>{

 try{

  const menus = await Menu.find();
  res.json(menus);

 }catch(err){

  res.status(500).json(err);

 }

});


/* ADD NEW MENU ITEM */

const upload = require("../middleware/upload");

router.post("/", upload.single("image"), async (req, res) => {

 try{

  const now = new Date();

  const days = [
   "Sunday","Monday","Tuesday",
   "Wednesday","Thursday","Friday","Saturday"
  ];

  const currentDay = days[now.getDay()];

  const hour = now.getHours();

  let currentTime;

  if(hour < 11){
   currentTime = "Breakfast";
  }
  else if(hour < 16){
   currentTime = "Lunch";
  }
  else{
   currentTime = "Dinner";
  }

  const isFriday = currentDay === "Friday" ? 1 : 0;
const isWeekend =
 (currentDay === "Saturday" || currentDay === "Sunday") ? 1 : 0;

const isSpecialDay =
 (currentDay === "Saturday" || currentDay === "Sunday") ? 1 : 0;


  /* GET REAL WEATHER */

  let weather = "Normal";

  try{

   const weatherRes = await axios.get(
    "https://api.open-meteo.com/v1/forecast?latitude=9.6615&longitude=80.0255&current_weather=true"
   );

   const temp = weatherRes.data.current_weather.temperature;

   if(temp < 26){
 weather = "Rainy";
}
else if(temp > 32){
 weather = "Sunny";
}
else{
 weather = "Cloudy";
}
  }catch(err){
   console.log("Weather API failed");
  }


  /* CHECK IF MENU ALREADY EXISTS */

  const existingMenu = await Menu.findOne({
   Food_Item: req.body.Food_Item
  });


  if(existingMenu){

   existingMenu.quantity =
    Number(existingMenu.quantity) + Number(req.body.quantity);

   existingMenu.availability =
    existingMenu.quantity > 0 ? "Available" : "Not Available";

   const updatedMenu = await existingMenu.save();

   return res.json(updatedMenu);

  }


  /* CALCULATE PREVIOUS SALES */

  const previousSales = await Order.countDocuments({
   Food_Item: req.body.Food_Item
  });


  /* CREATE NEW MENU */

  const newMenu = new Menu({

   Food_Item: req.body.Food_Item,
   Food_Type: req.body.Food_Type,
   Food_Category: req.body.Food_Category,

   // ✅ REQUIRED FIX (ADDED)
   Food_SubType: req.body.Food_SubType || "Meal",

   Price: Number(req.body.Price),

   image: req.file ? req.file.filename : "",

   quantity: Number(req.body.quantity),
   availability: req.body.availability,

   Day: currentDay,
   Time: currentTime,
   Weather: weather,

   Previous_Sales: previousSales,

   Is_Friday: isFriday,
   Is_Weekend: isWeekend,
   Is_Special_Day: isSpecialDay

  });


  const savedMenu = await newMenu.save();


  /* AUTOMATIC AI RETRAINING */
  retrainAI();


  res.json(savedMenu);

 }catch(err){

  console.log(err);
  res.status(500).json(err);

 }

});


/* DELETE MENU */

router.delete("/:id", async(req,res)=>{

 try{

  await Menu.findByIdAndDelete(req.params.id);

  res.json("Menu Deleted");

 }catch(err){

  res.status(500).json(err);

 }

});


/* INCREASE QUANTITY */

router.put("/increase/:id", async (req,res)=>{

 try{

  const menu = await Menu.findById(req.params.id);

  menu.quantity = Number(menu.quantity) + 1;

  menu.availability =
   menu.quantity > 0 ? "Available" : "Not Available";

  await menu.save();

  res.json(menu);

 }catch(err){

  res.status(500).json(err);

 }

});

// ==============================
// DECREASE QUANTITY
// ==============================
router.put("/decrease/:id", async (req,res)=>{

  try{

    const menu = await Menu.findById(req.params.id);

    if(!menu) return res.status(404).json("Menu not found");

    // ❌ prevent negative stock
    if(menu.quantity > 0){
      menu.quantity -= 1;
    }

    // update availability
    menu.availability = menu.quantity > 0 ? "Available" : "Not Available";

    await menu.save();

    res.json(menu);

  }catch(err){
    res.status(500).json(err);
  }

});

// ==============================
// UPDATE MENU (EDIT)
// ==============================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        Food_Item: req.body.Food_Item,
        Food_Type: req.body.Food_Type,
        Food_Category: req.body.Food_Category,
        Food_SubType: req.body.Food_SubType,
        Price: Number(req.body.Price),
        quantity: Number(req.body.quantity),
        image: req.file ? req.file.filename : req.body.image,
        availability: req.body.availability
      },
      { new: true }
    );

    if(!updatedMenu){
      return res.status(404).json("Menu not found");
    }

    res.json(updatedMenu);

  }catch(err){
  console.log("FULL ERROR:", err);
  res.status(500).json({ error: err.message });
}
});

module.exports = router;