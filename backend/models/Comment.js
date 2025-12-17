const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: [true, "Please add comment content"]
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
