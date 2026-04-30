const protect = require("../middleware/authMiddleware");
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.use(protect);

/* GET ALL USERS */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ADD USER (ADMIN ONLY) */
router.post("/", async (req, res) => {
  try {
    if (req.body.currentRole !== "admin") {
      return res.status(403).json("Only admin can add users");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role
    });

    const savedUser = await newUser.save();
    res.json(savedUser);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* DELETE USER */
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json("User deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

/* GET SINGLE USER (PROFILE) */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* UPDATE USER (PROFILE) */
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        email: req.body.email,
        phone: req.body.phone
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;