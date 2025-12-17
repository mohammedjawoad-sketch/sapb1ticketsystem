const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").populate("companyId", "name");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role, companyId, department, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || "customer",
      companyId,
      department,
      phone
    });

    user.passwordHash = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message
    });
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;
