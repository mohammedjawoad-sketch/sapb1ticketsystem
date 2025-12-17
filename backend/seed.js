const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Company = require("./models/Company");

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log("Cleared existing data");

    // Create companies
    const companies = await Company.insertMany([
      { name: "Acme Corporation", industry: "Manufacturing" },
      { name: "TechStart Inc", industry: "Technology" },
      { name: "Global Retail Ltd", industry: "Retail" }
    ]);
    console.log("Companies created:", companies.length);

    // Create users
    const users = await User.create([
      {
        email: "admin@sapb1.com",
        name: "Admin User",
        role: "admin",
        passwordHash: "password123",
        companyId: companies[0]._id,
        department: "IT",
        phone: "+1234567890"
      },
      {
        email: "support@sapb1.com",
        name: "Support Agent",
        role: "supportagent",
        passwordHash: "password123",
        companyId: companies[0]._id,
        department: "Support",
        phone: "+1234567891"
      },
      {
        email: "john@acme.com",
        name: "John Doe",
        role: "customer",
        passwordHash: "password123",
        companyId: companies[0]._id,
        department: "IT",
        phone: "+1234567892"
      },
      {
        email: "sarah@techstart.com",
        name: "Sarah Smith",
        role: "customer",
        passwordHash: "password123",
        companyId: companies[1]._id,
        department: "Finance",
        phone: "+1234567893"
      },
      {
        email: "mike@globalretail.com",
        name: "Mike Johnson",
        role: "customer",
        passwordHash: "password123",
        companyId: companies[2]._id,
        department: "Operations",
        phone: "+1234567894"
      }
    ]);
    console.log("Users created:", users.length);

    console.log("\n✅ Seed data created successfully!");
    console.log("\nLogin credentials (all passwords: password123):");
    console.log("  Admin:    admin@sapb1.com");
    console.log("  Support:  support@sapb1.com");
    console.log("  Customer: john@acme.com");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
