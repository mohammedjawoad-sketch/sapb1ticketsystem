const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Ticket = require("../models/Ticket");
const { protect } = require("../middleware/auth");

router.get("/ticket/:ticketId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ ticketId: req.params.ticketId })
      .sort({ orderIndex: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { ticketId, title, description, status, orderIndex } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    const task = await Task.create({
      ticketId,
      title,
      description,
      status: status || "To-Do",
      orderIndex: orderIndex || 0
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;
