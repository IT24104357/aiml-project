const protect = require("../middleware/authMiddleware");

const router = require("express").Router();
const Sales = require("../models/Sales");   // ✅ NEW
const axios = require("axios");

router.use(protect);


// -----------------------------
// SALES REPORT (UPDATED)
// -----------------------------
router.get("/", async (req, res) => {

  try {

    // ✅ USE SALES COLLECTION (NOT ORDER)
    const sales = await Sales.find();

    const dailyOrders = {};
    const itemSales = {};
    const brandSales = {};

    let totalRevenue = 0;
    let totalItemsSold = 0;

    sales.forEach(sale => {

      const date = new Date(sale.soldAt)
        .toISOString()
        .split("T")[0];

      // daily total
      if (!dailyOrders[date]) dailyOrders[date] = 0;
      dailyOrders[date] += sale.quantity;

      // item-wise
      if (!itemSales[sale.Food_Item]) itemSales[sale.Food_Item] = 0;
      itemSales[sale.Food_Item] += sale.quantity;

      // type-wise
      if (!brandSales[sale.Food_Type]) brandSales[sale.Food_Type] = 0;
      brandSales[sale.Food_Type] += sale.quantity;

      totalRevenue += sale.totalPrice;
      totalItemsSold += sale.quantity;

    });

    const topItem = Object.entries(itemSales)
      .sort((a,b)=>b[1]-a[1])[0];

    res.json({
      dailyOrders,
      itemSales,
      brandSales,
      totalRevenue,
      totalItemsSold,
      topItem,
      allSales: sales
    });

  } catch(err){

    res.status(500).json(err);

  }

});


// -----------------------------
// PREDICTION ACCURACY (UPDATED)
// -----------------------------
router.get("/accuracy", async (req,res)=>{

 try{

   // ✅ USE SALES INSTEAD OF ORDERS
   const sales = await Sales.find();

   let actualSales = {};

   sales.forEach(sale=>{

     if(!actualSales[sale.Food_Item])
        actualSales[sale.Food_Item] = 0;

     actualSales[sale.Food_Item] += sale.quantity;

   });


   // AI predictions
   const pred = await axios.get("http://localhost:5000/predict");

   const predictions = pred.data;

   let results = [];

   predictions.forEach(p=>{

      const food = p.food;

      const predicted = p.prediction.Day1;

      const actual = actualSales[food] || 0;

      let accuracy = 0;

      if(predicted > 0){

         const error = Math.abs(predicted - actual);

         accuracy = (1 - error / predicted) * 100;

         if(accuracy < 0) accuracy = 0;

      }

      results.push({
        food,
        predicted,
        actual,
        accuracy: accuracy.toFixed(2)
      });

   });

   res.json(results);

 }catch(err){

   res.status(500).json({error: err.message});

 }

});

module.exports = router;