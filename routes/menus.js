const protect = require("../middleware/authMiddleware");
const router = require("express").Router();
const Menu = require("../models/Menu");

router.use(protect);

router.get("/", async (req,res)=>{

 try{

  const menu = await Menu.find();

  res.json(menu);

 }catch(err){

  res.status(500).json(err);

 }

});


module.exports = router;