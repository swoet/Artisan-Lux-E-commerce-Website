import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCustomOrderNotification(data: {
  artisanEmail: string;
  artisanName: string;
  customerName: string;
  productName: string;
  customizationDetails: string;
  orderUrl: string;
}) {
  try {
    await resend.emails.send({
      from: "Artisan Lux <orders@artisanlux.com>",
      to: data.artisanEmail,
      subject: `New Custom Order Request - ${data.productName}`,
      html: `
        <h2>New Custom Order Request</h2>
        <p>Hi ${data.artisanName},</p>
        <p>You have received a new custom order request from <strong>${data.customerName}</strong>.</p>
        
        <h3>Product: ${data.productName}</h3>
        <h4>Customization Details:</h4>
        <p>${data.customizationDetails}</p>
        
        <p><a href="${data.orderUrl}" style="background: #2a1a10; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Details</a></p>
        
        <p>Please review the request and provide a quote within 48 hours.</p>
        
        <p>Best regards,<br>Artisan Lux Team</p>
      `,
    });
  } catch (error) {
    console.error("Error sending custom order notification:", error);
  }
}

export async function sendProductionUpdateNotification(data: {
  customerEmail: string;
  customerName: string;
  productName: string;
  stage: string;
  artisanNotes?: string;
  orderUrl: string;
}) {
  try {
    await resend.emails.send({
      from: "Artisan Lux <orders@artisanlux.com>",
      to: data.customerEmail,
      subject: `Production Update: ${data.productName}`,
      html: `
        <h2>Production Update</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your custom order has been updated!</p>
        
        <h3>${data.productName}</h3>
        <p><strong>Current Stage:</strong> ${data.stage}</p>
        ${data.artisanNotes ? `<p><strong>Artisan Notes:</strong><br>${data.artisanNotes}</p>` : ""}
        
        <p><a href="${data.orderUrl}" style="background: #2a1a10; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Status</a></p>
        
        <p>Thank you for your patience!</p>
        
        <p>Best regards,<br>Artisan Lux Team</p>
      `,
    });
  } catch (error) {
    console.error("Error sending production update notification:", error);
  }
}

export async function sendLowStockAlert(data: {
  artisanEmail: string;
  artisanName: string;
  productName: string;
  currentStock: number;
  threshold: number;
}) {
  try {
    await resend.emails.send({
      from: "Artisan Lux <alerts@artisanlux.com>",
      to: data.artisanEmail,
      subject: `Low Stock Alert: ${data.productName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>Hi ${data.artisanName},</p>
        <p>Your product <strong>${data.productName}</strong> is running low on stock.</p>
        
        <p><strong>Current Stock:</strong> ${data.currentStock} units<br>
        <strong>Threshold:</strong> ${data.threshold} units</p>
        
        <p>Please restock soon to avoid missing sales opportunities.</p>
        
        <p>Best regards,<br>Artisan Lux Team</p>
      `,
    });
  } catch (error) {
    console.error("Error sending low stock alert:", error);
  }
}

export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await resend.emails.send({
      from: "Artisan Lux <noreply@artisanlux.com>",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
