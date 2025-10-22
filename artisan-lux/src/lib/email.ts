import { Resend } from "resend";

// Lazy initialization - only create when needed
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

export type EmailTemplate = "order-confirmation" | "abandoned-cart" | "newsletter";

type OrderConfirmationData = {
  customerEmail: string;
  customerName: string;
  orderId: number;
  orderTotal: string;
  orderItems: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  paymentMethod: string;
};

type AbandonedCartData = {
  customerEmail: string;
  customerName?: string;
  cartItems: Array<{
    title: string;
    price: string;
    imageUrl?: string;
  }>;
  cartTotal: string;
};

type NewsletterData = {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
};

// Order Confirmation Email
export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  try {
    const itemsList = data.orderItems
      .map(
        (item) =>
          `<li style="margin-bottom: 10px;">
            ${item.title} - Qty: ${item.quantity} - ${item.price}
          </li>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; max-width: 600px; margin: 0 auto; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; }
            .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-family: 'Playfair Display', serif; margin: 0;">Artisan Lux</h1>
            <p style="margin: 10px 0 0;">Order Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your order, ${data.customerName}!</h2>
            <p>Your order #${data.orderId} has been received and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Summary</h3>
              <ul style="list-style: none; padding: 0;">
                ${itemsList}
              </ul>
              <hr style="border: 1px solid #e5e5e5; margin: 20px 0;">
              <p style="font-size: 18px; font-weight: bold;">Total: ${data.orderTotal}</p>
              <p>Payment Method: ${data.paymentMethod}</p>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Artisan Lux. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: "Artisan Lux <orders@artisanlux.com>",
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderId}`,
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

// Abandoned Cart Email
export async function sendAbandonedCartEmail(data: AbandonedCartData) {
  try {
    const itemsList = data.cartItems
      .map(
        (item) =>
          `<div style="display: flex; margin-bottom: 15px; align-items: center;">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">`
                : ""
            }
            <div>
              <h4 style="margin: 0 0 5px;">${item.title}</h4>
              <p style="margin: 0; color: #666;">${item.price}</p>
            </div>
          </div>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; }
            .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; max-width: 600px; margin: 0 auto; }
            .cta { background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-family: 'Playfair Display', serif; margin: 0;">Artisan Lux</h1>
          </div>
          
          <div class="content">
            <h2>You left something behind${data.customerName ? `, ${data.customerName}` : ""}!</h2>
            <p>Your cart is waiting for you. Complete your purchase before these items are gone.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${itemsList}
              <hr style="border: 1px solid #e5e5e5; margin: 20px 0;">
              <p style="font-size: 18px; font-weight: bold;">Total: ${data.cartTotal}</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cart" class="cta">
              Complete Your Purchase
            </a>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: "Artisan Lux <hello@artisanlux.com>",
      to: data.customerEmail,
      subject: "Your Artisan Lux cart is waiting",
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

// Newsletter Email
export async function sendNewsletterEmail(data: NewsletterData) {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: "Artisan Lux <newsletter@artisanlux.com>",
      to: data.recipientEmail,
      subject: data.subject,
      html: data.content,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
