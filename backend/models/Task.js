const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  title: {
    type: String,
    required: [true, "Please add a task title"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["To-Do", "In-Progress", "Blocked", "Done"],
    default: "To-Do"
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

taskSchema.index({ ticketId: 1, orderIndex: 1 });

module.exports = mongoose.model("Task", taskSchema);
