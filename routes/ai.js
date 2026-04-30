
const protect = require("../middleware/authMiddleware");
const router = require("express").Router();
const { exec } = require("child_process");
const path = require("path");

router.use(protect);

router.post("/predict", (req, res) => {

  const input = JSON.stringify(req.body);

  const scriptPath = path.join(__dirname, "../ai/predict.py");

  exec(`python3 "${scriptPath}" '${input}'`), (error, stdout, stderr) => {

    if (error) {
      console.log("Python error:", error);
      console.log(stderr);
      return res.json({ error: "Prediction failed" });
    }

    res.json({
      predicted_quantity: parseInt(stdout)
    });

  });

});

module.exports = router;