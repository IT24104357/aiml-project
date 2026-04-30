

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const salesRoute = require("./routes/sales");
const orderRoute = require("./routes/orders");
const aiRoute = require("./routes/ai");
const predictRoute = require("./routes/predict");
const authRoute = require("./routes/auth");
const menuRoute = require("./routes/menus");
const menuManagementRoute = require("./routes/menuManagement");
const userRoute = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

app.use("/uploads", express.static("uploads"));
app.use("/sales", salesRoute);
app.use("/orders", orderRoute);
app.use("/ai", aiRoute);
app.use("/predict", predictRoute);
app.use("/auth", authRoute);
app.use("/menu-management", menuManagementRoute);
app.use("/users", userRoute);
app.use("/menus", menuRoute);

// start only when run directly
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Backend running on port", PORT);
  });
}

// export for testing
module.exports = app;