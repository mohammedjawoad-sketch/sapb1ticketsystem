const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  },
  filename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String
  },
  storagePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Attachment", attachmentSchema);
