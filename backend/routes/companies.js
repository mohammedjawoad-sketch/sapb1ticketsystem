const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { name, industry } = req.body;

    const company = await Company.create({
      name,
      industry
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message
    });
  }
});

module.exports = router;
