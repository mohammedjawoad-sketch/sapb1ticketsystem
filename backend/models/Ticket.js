const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Please add a description"]
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["New", "Open", "In-Progress", "Resolved", "Closed"],
    default: "New"
  },
  module: {
    type: String,
    enum: ["Sales", "Purchasing", "Inventory", "Finance", "Production", "General", "Other"],
    trim: true
  },
  category: {
    type: String,
    enum: ["Bug", "How-to", "Change Request", "Performance", "Integration", "Other"],
    trim: true
  },
  aiSummary: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },
  department: {
    type: String,
    trim: true
  },
  supportNotes: {
    type: String
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ companyId: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
