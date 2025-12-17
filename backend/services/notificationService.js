const nodemailer = require("nodemailer");
const TelegramBot = require("node-telegram-bot-api");

// Email transporter
let emailTransporter = null;

// Initialize email transporter
if (process.env.EMAIL_ENABLED === "true") {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Telegram bot
let telegramBot = null;

if (process.env.TELEGRAM_ENABLED === "true" && process.env.TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

// Send Telegram notification
async function sendTelegramNotification(message) {
  if (!telegramBot || !process.env.TELEGRAM_CHAT_ID) {
    console.log("Telegram not configured, skipping notification");
    return;
  }

  try {
    await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: "HTML",
    });
    console.log("✅ Telegram notification sent");
  } catch (error) {
    console.error("❌ Telegram notification failed:", error.message);
  }
}

// Send Email notification
async function sendEmailNotification(subject, htmlContent, to) {
  if (!emailTransporter) {
    console.log("Email not configured, skipping notification");
    return;
  }

  try {
    const mailOptions = {
      from: `"SAP B1 Support" <${process.env.EMAIL_USER}>`,
      to: to || process.env.SUPPORT_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log("✅ Email notification sent to:", mailOptions.to);
  } catch (error) {
    console.error("❌ Email notification failed:", error.message);
  }
}

// Notify support team about new ticket
async function notifyNewTicket(ticket, user) {
  const ticketId = ticket._id.toString().slice(-8);
  const ticketUrl = `${process.env.CLIENT_URL || "http://10.0.10.134:5173"}`;

  // Telegram Message
  const telegramMessage = `
🎫 <b>New Support Ticket</b>

📋 <b>Title:</b> ${ticket.title}
👤 <b>Customer:</b> ${user.name} (${user.email})
🏢 <b>Company:</b> ${ticket.companyId?.name || "N/A"}
📍 <b>Department:</b> ${ticket.department || "N/A"}
⚠️ <b>Priority:</b> ${ticket.priority}
📦 <b>Module:</b> ${ticket.module || "N/A"}
�� <b>Ticket #:</b> ${ticketId}

📝 <b>Description:</b>
${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? "..." : ""}

🤖 <b>AI Summary:</b>
${ticket.aiSummary || "Processing..."}

🔗 <a href="${ticketUrl}">Open System</a>
  `.trim();

  // Email HTML
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
    .label { font-weight: bold; color: #4b5563; }
    .priority-high { color: #dc2626; font-weight: bold; }
    .priority-critical { color: #991b1b; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎫 New Support Ticket Created</h2>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="label">Ticket ID:</span> #${ticketId}
      </div>
      <div class="info-row">
        <span class="label">Title:</span> ${ticket.title}
      </div>
      <div class="info-row">
        <span class="label">Customer:</span> ${user.name} (${user.email})
      </div>
      <div class="info-row">
        <span class="label">Company:</span> ${ticket.companyId?.name || "N/A"}
      </div>
      <div class="info-row">
        <span class="label">Department:</span> ${ticket.department || "N/A"}
      </div>
      <div class="info-row">
        <span class="label">Priority:</span> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
      </div>
      <div class="info-row">
        <span class="label">Module:</span> ${ticket.module || "N/A"}
      </div>
      <div class="info-row">
        <span class="label">Description:</span><br>
        <p>${ticket.description}</p>
      </div>
      ${
        ticket.aiSummary
          ? `<div class="info-row" style="background: #f3e8ff; border-left: 4px solid #9333ea;">
        <span class="label">🤖 AI Summary:</span><br>
        <p>${ticket.aiSummary}</p>
      </div>`
          : ""
      }
      <a href="${ticketUrl}" class="button">Open Support System</a>
    </div>
    <div class="footer">
      <p>SAP Business One Support System</p>
      <p>This is an automated notification</p>
    </div>
  </div>
</body>
</html>
  `;

  // Send both notifications
  await Promise.all([
    sendTelegramNotification(telegramMessage),
    sendEmailNotification(`New Support Ticket: ${ticket.title}`, emailHtml),
  ]);
}

// Notify customer that ticket was created
async function notifyCustomerTicketCreated(ticket, user) {
  const ticketId = ticket._id.toString().slice(-8);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Ticket Created Successfully</h2>
    </div>
    <div class="content">
      <p>Dear ${user.name},</p>
      <p>Thank you for contacting SAP B1 Support. Your ticket has been created and assigned to our support team.</p>
      
      <div class="info-box">
        <strong>Ticket ID:</strong> #${ticketId}<br>
        <strong>Title:</strong> ${ticket.title}<br>
        <strong>Priority:</strong> ${ticket.priority}<br>
        <strong>Status:</strong> ${ticket.status}
      </div>

      <p>We will review your request and respond as soon as possible.</p>
      
      <p>Best regards,<br>
      SAP B1 Support Team</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmailNotification(
    `Ticket Created: ${ticket.title}`,
    emailHtml,
    user.email
  );
}

module.exports = {
  notifyNewTicket,
  notifyCustomerTicketCreated,
  sendTelegramNotification,
  sendEmailNotification,
};
