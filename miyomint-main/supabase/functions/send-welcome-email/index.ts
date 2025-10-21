import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
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
    } catch {
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
    const payload: WebhookPayload = await req.json();
    
    console.log('Webhook received:', payload);

    if (payload.type !== 'INSERT') {
      return new Response(
        JSON.stringify({ message: 'Not an insert event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const email = payload.record.email;
    const meta = payload.record.raw_user_meta_data ?? {};
    const fullName = meta.full_name || meta.first_name || "Değerli Müşterimiz";
    const preferredName = (fullName || "Değerli Müşterimiz").trim().split(" ")[0] || "Değerli Müşterimiz";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Hoş Geldiniz - MiyoMint</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Hoş Geldiniz!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Merhaba ${preferredName},</p>
            
            <p style="font-size: 16px; line-height: 1.8;">
              MiyoMint ailesine katıldığınız için çok mutluyuz! 🌟
            </p>
            
            <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #0f766e;">
                <strong>✨ Özel Hoş Geldin Hediyesi:</strong><br>
                İlk siparişinizde <strong>%10 indirim</strong> kazanın!
              </p>
            </div>
            
            <p style="font-size: 16px;">Hesabınızla yapabilecekleriniz:</p>
            
            <ul style="font-size: 15px; line-height: 2; color: #4b5563;">
              <li>🛍️ Hızlı ve güvenli alışveriş</li>
              <li>📦 Sipariş takibi</li>
              <li>💳 Kayıtlı ödeme yöntemleri</li>
              <li>🎁 Özel kampanyalardan haberdar olun</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://miyomint.com" style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">Alışverişe Başla</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 15px;">
              Herhangi bir sorunuz olursa, <a href="mailto:info@miyomint.com.tr" style="color: #14b8a6; text-decoration: none; font-weight: 600;">bize ulaşmaktan</a> çekinmeyin.
            </p>
            
            <p style="margin-top: 30px;">Sevgilerle,<br><strong>MiyoMint Ekibi</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            <p style="margin-top: 10px;">© 2024 MiyoMint. Tüm hakları saklıdır.</p>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, 'MiyoMint\'e Hoş Geldiniz! 🎉', emailHtml);

    console.log('Welcome email sent successfully to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
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
