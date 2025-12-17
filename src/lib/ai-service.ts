export async function analyzeTicket(ticketData: any, attachmentInfo: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const description = (ticketData.description || "").toLowerCase();
  const title = (ticketData.title || "").toLowerCase();
  const text = `${title} ${description}`;

  let module = ticketData.module || "General";
  if (!ticketData.module) {
    if (text.includes("sale") || text.includes("order") || text.includes("invoice")) module = "Sales";
    else if (text.includes("purchase") || text.includes("vendor") || text.includes("po")) module = "Purchasing";
    else if (text.includes("inventory") || text.includes("stock") || text.includes("warehouse")) module = "Inventory";
    else if (text.includes("finance") || text.includes("account") || text.includes("payment")) module = "Finance";
    else if (text.includes("production") || text.includes("manufacturing") || text.includes("bom")) module = "Production";
  }

  let category = "Other";
  if (text.includes("error") || text.includes("bug") || text.includes("not working")) category = "Bug";
  else if (text.includes("how to") || text.includes("help") || text.includes("guide")) category = "How-to";
  else if (text.includes("change") || text.includes("modify") || text.includes("add")) category = "Change Request";
  else if (text.includes("slow") || text.includes("performance") || text.includes("timeout")) category = "Performance";
  else if (text.includes("integration") || text.includes("api") || text.includes("connect")) category = "Integration";

  const aisummary = `Issue related to ${module} module. Priority: ${ticketData.priority}. Category: ${category}. Requires immediate attention from support team.`;

  const tasks = [
    {
      title: "Initial Assessment",
      description: "Review ticket details and gather additional information if needed"
    },
    {
      title: "Investigate Issue",
      description: `Investigate the ${module} module to identify root cause`
    },
    {
      title: "Develop Solution",
      description: "Create and test solution based on findings"
    },
    {
      title: "Customer Communication",
      description: "Update customer with findings and resolution timeline"
    }
  ];

  if (ticketData.priority === "Critical" || ticketData.priority === "High") {
    tasks.unshift({
      title: "Immediate Response Required",
      description: "Contact customer immediately to acknowledge the urgent issue"
    });
  }

  return {
    aisummary,
    module,
    category,
    tasks
  };
}

export function getEmailTemplate(type: string, ticket: any, user: any, additionalInfo: string) {
  const templates: any = {
    newticket: {
      subject: `New Support Ticket #${ticket._id?.toString().slice(-6)} - ${ticket.title}`,
      body: `Dear ${user.name},

Thank you for contacting SAP B1 Support. We have received your ticket.

Ticket Details:
- Title: ${ticket.title}
- Priority: ${ticket.priority}
- Status: ${ticket.status}
- Module: ${ticket.module || 'N/A'}

${additionalInfo}

We will review your request and get back to you shortly.

Best regards,
SAP B1 Support Team`
    },
    update: {
      subject: `Ticket Update #${ticket._id?.toString().slice(-6)} - ${ticket.title}`,
      body: `Dear ${user.name},

Your support ticket has been updated.

Current Status: ${ticket.status}
Priority: ${ticket.priority}

${additionalInfo}

Best regards,
SAP B1 Support Team`
    },
    resolved: {
      subject: `Ticket Resolved #${ticket._id?.toString().slice(-6)} - ${ticket.title}`,
      body: `Dear ${user.name},

Your support ticket has been resolved.

Resolution Notes:
${additionalInfo}

If you have any questions or need further assistance, please don't hesitate to contact us.

Best regards,
SAP B1 Support Team`
    }
  };

  return templates[type] || templates.newticket;
}

export function getWhatsAppTemplate(type: string, ticket: any, user: any, additionalInfo: string) {
  const templates: any = {
    newticket: `Hi ${user.name}! Your ticket #${ticket._id?.toString().slice(-6)} (${ticket.title}) has been received. Status: ${ticket.status}. We'll update you soon! - SAP B1 Support`,
    update: `Hi ${user.name}! Update on ticket #${ticket._id?.toString().slice(-6)}: ${ticket.status}. ${additionalInfo} - SAP B1 Support`,
    resolved: `Hi ${user.name}! Your ticket #${ticket._id?.toString().slice(-6)} has been resolved. ${additionalInfo} - SAP B1 Support`
  };

  return templates[type] || templates.newticket;
}
