require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

console.log("🧪 Testing Telegram Configuration");
console.log("================================");
console.log("TELEGRAM_ENABLED:", process.env.TELEGRAM_ENABLED);
console.log("TELEGRAM_BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Missing");
console.log("TELEGRAM_CHAT_ID:", process.env.TELEGRAM_CHAT_ID);
console.log("");

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
  process.exit(1);
}

if (!process.env.TELEGRAM_CHAT_ID) {
  console.error("❌ TELEGRAM_CHAT_ID is missing in .env");
  process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

console.log("📤 Sending test message...");

bot.sendMessage(process.env.TELEGRAM_CHAT_ID, "✅ SAP B1 Support System - Telegram Test Successful!")
  .then(() => {
    console.log("✅ Message sent successfully!");
    console.log("Check your Telegram now!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to send message:", error.message);
    process.exit(1);
  });
