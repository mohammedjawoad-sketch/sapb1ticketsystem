const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const { protect } = require("../middleware/auth");

router.get("/ticket/:ticketId", protect, async (req, res) => {
  try {
    let query = { ticketId: req.params.ticketId };

    if (req.user.role === "customer") {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate("userId", "name email role department")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { ticketId, content, isInternal } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found"
      });
    }

    const internal = req.user.role === "customer" ? false : (isInternal || false);

    const comment = await Comment.create({
      ticketId,
      userId: req.user.id,
      content,
      isInternal: internal
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name email role department");

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;
