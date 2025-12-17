const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { analyzeTicket } = require("../services/aiService");
const { notifyNewTicket } = require("../services/notificationService"); 

router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "customer") {
      query.userId = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate("userId", "name email role department")
      .populate("companyId", "name industry")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("userId", "name email role department phone")
      .populate("companyId", "name industry")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    if (req.user.role === "customer" && ticket.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this ticket"
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, description, priority, module, attachmentInfo } = req.body;

    const aiResult = await analyzeTicket({
      title,
      description,
      priority,
      module
    }, attachmentInfo || "No attachments");

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || "Medium",
      module: aiResult.module,
      category: aiResult.category,
      aiSummary: aiResult.aisummary,
      userId: req.user.id,
      companyId: req.user.companyId,
      department: req.user.department,
      status: "New"
    });

    if (aiResult.tasks && aiResult.tasks.length > 0) {
      const tasks = aiResult.tasks.map((task, index) => ({
        ticketId: ticket._id,
        title: task.title,
        description: task.description,
        status: "To-Do",
        orderIndex: index
      }));
      await Task.insertMany(tasks);
    }

         const populatedTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name email role department")
      .populate("companyId", "name industry");

    // Send notifications
    console.log("🔔 Sending notification...");
    notifyNewTicket(populatedTicket, req.user).catch(err => {
      console.error("Notification error:", err.message);
    });

    res.status(201).json({
      success: true,
      data: populatedTicket
    });


    // Send notification - ADD THIS
 
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    if (req.user.role === "customer" && ticket.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this ticket"
      });
    }

    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("userId", "name email role department")
     .populate("companyId", "name industry");

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;
