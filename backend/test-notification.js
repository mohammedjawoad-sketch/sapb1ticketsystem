require("dotenv").config();
const { notifyNewTicket } = require("./services/notificationService");

console.log("🧪 Testing notification function...");
console.log("");

// Mock ticket data
const mockTicket = {
  _id: "507f1f77bcf86cd799439011",
  title: "Test Ticket",
  description: "This is a test ticket to verify notifications work",
  priority: "High",
  status: "New",
  module: "Sales",
  category: "Bug",
  aiSummary: "Test ticket for notification system",
  createdAt: new Date(),
  companyId: { name: "Test Company" },
  department: "IT"
};

const mockUser = {
  name: "Test Customer",
  email: "customer@test.com",
  phone: "+1234567890"
};

notifyNewTicket(mockTicket, mockUser)
  .then(() => {
    console.log("");
    console.log("✅ Notification test completed!");
    console.log("Check:");
    console.log("1. Telegram");
    console.log("2. Email: sap.support@alrafidain-group.com");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  });
