import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailRequest {
  to: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  customerName: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const conn = await Deno.connect({
    hostname: "mail.kurumsaleposta.com",
    port: 587,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function read() {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    if (n === null) return null;
    return decoder.decode(buffer.subarray(0, n));
  }

  async function write(data: string) {
    await conn.write(encoder.encode(data));
  }

  try {
    await read();
    await write("EHLO miyomint.com.tr\r\n");
    await read();
    
    await write("AUTH LOGIN\r\n");
    await read();
    
    const username = btoa("info@miyomint.com.tr");
    await write(username + "\r\n");
    await read();
    
    const password = btoa("Miyo12393");
    await write(password + "\r\n");
    await read();
    
    await write("MAIL FROM:<info@miyomint.com.tr>\r\n");
    await read();
    
    await write(`RCPT TO:<${to}>\r\n`);
    await read();
    
    await write("DATA\r\n");
    await read();
    
    const emailContent = [
      `From: MiyoMint <info@miyomint.com.tr>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      html,
      `.`,
    ].join("\r\n");
    
    await write(emailContent + "\r\n");
    await read();
    
    await write("QUIT\r\n");
    await read();
    
    conn.close();
  } catch (error) {
    try {
      conn.close();
    } catch (e) {
      // Ignore close errors
    }
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, orderNumber, items, totalAmount, customerName }: OrderEmailRequest = await req.json();

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price} ₺</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sipariş Onayı</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Siparişiniz Alındı!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Merhaba ${customerName},</p>
            
            <p>Siparişiniz başarıyla alınmıştır. Aşağıda sipariş detaylarınızı bulabilirsiniz:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Sipariş Numarası</p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #14b8a6;">${orderNumber}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Ürün</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Adet</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 16px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Toplam:</td>
                  <td style="padding: 16px; text-align: right; font-weight: bold; font-size: 20px; color: #14b8a6; border-top: 2px solid #e5e7eb;">${totalAmount} ₺</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;">🚚 Siparişiniz 2-3 iş günü içinde kargoya verilecektir.</p>
            </div>
            
            <p>Herhangi bir sorunuz olursa, bizimle iletişime geçmekten çekinmeyin.</p>
            
            <p style="margin-top: 30px;">Teşekkür ederiz,<br><strong>MiyoMint Ekibi</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>© 2024 MiyoMint. Tüm hakları saklıdır.</p>
          </div>
        </body>
      </html>
    `;

    await sendEmail(to, `Sipariş Onayı - ${orderNumber}`, emailHtml);

    console.log('Order confirmation email sent to:', to);
    console.log('Order number:', orderNumber);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        orderNumber
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});