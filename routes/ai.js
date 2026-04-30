const protect = require("../middleware/authMiddleware");
const router = require("express").Router();
const axios = require("axios");

router.use(protect);

router.post("/predict", async (req, res) => {
  try {
    const response = await axios.post(
      "https://aiml-project-ai.onrender.com/predict",
      req.body
    );

    res.json(response.data);

  } catch (error) {
    console.log("AI API error:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

module.exports = router;