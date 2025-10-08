import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerificationEmailRequest {
  email: string;
  fullName: string;
  confirmationUrl: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log('=== STARTING EMAIL SEND ===');
  console.log('To:', to);
  console.log('Subject:', subject);

  let conn;
  try {
    console.log('Connecting to SMTP server with TLS on port 465...');
    conn = await Deno.connectTls({
      hostname: "mail.kurumsaleposta.com",
      port: 465,
    });
    console.log('Connected to SMTP server with TLS');
  } catch (error) {
    console.error('Failed to connect to SMTP server:', error);
    throw new Error('SMTP sunucusuna bağlanılamadı: ' + error.message);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function read() {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    if (n === null) return null;
    const response = decoder.decode(buffer.subarray(0, n));
    console.log('SMTP <-', response.trim());
    return response;
  }

  async function write(data: string) {
    console.log('SMTP ->', data.replace(/^([A-Z]+)\s+(.+)$/m, (match, cmd, rest) => {
      if (cmd === 'AUTH' || rest.length > 20) {
        return `${cmd} [REDACTED]`;
      }
      return match;
    }).trim());
    await conn.write(encoder.encode(data));
  }

  try {
    const greeting = await read();
    if (!greeting || !greeting.includes('220')) {
      throw new Error('SMTP sunucusu yanıt vermiyor');
    }
    
    await write("EHLO miyomint.com.tr\r\n");
    await read();
    
    console.log('Authenticating...');
    await write("AUTH LOGIN\r\n");
    const authPrompt = await read();
    
    if (!authPrompt || !authPrompt.includes('334')) {
      throw new Error('AUTH LOGIN desteklenmiyor');
    }
    
    const username = btoa("info@miyomint.com.tr");
    await write(username + "\r\n");
    const userResponse = await read();
    
    if (!userResponse || !userResponse.includes('334')) {
      throw new Error('Kullanıcı adı kabul edilmedi');
    }
    
    const password = btoa("MEme1101399.");
    await write(password + "\r\n");
    const authResponse = await read();
    
    if (!authResponse || !authResponse.includes('235')) {
      console.error('Auth response:', authResponse);
      throw new Error('Şifre doğrulaması başarısız');
    }
    console.log('Authentication successful');
    
    await write("MAIL FROM:<info@miyomint.com.tr>\r\n");
    const mailFromResponse = await read();
    if (!mailFromResponse || !mailFromResponse.includes('250')) {
      throw new Error('MAIL FROM kabul edilmedi');
    }
    
    await write(`RCPT TO:<${to}>\r\n`);
    const rcptToResponse = await read();
    if (!rcptToResponse || !rcptToResponse.includes('250')) {
      throw new Error('RCPT TO kabul edilmedi: ' + to);
    }
    
    await write("DATA\r\n");
    const dataPrompt = await read();
    if (!dataPrompt || !dataPrompt.includes('354')) {
      throw new Error('DATA komutu kabul edilmedi');
    }
    
    const sanitizedHtml = html.replace(/\r?\n/g, '\r\n');
    const sanitizedSubject = subject.replace(/\r?\n/g, ' ');
    
    const emailContent = [
      `From: MiyoMint <info@miyomint.com.tr>`,
      `To: ${to}`,
      `Subject: ${sanitizedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      sanitizedHtml,
      `.`,
    ].filter(line => line !== '').join("\r\n");
    
    await write(emailContent + "\r\n");
    const dataResponse = await read();
    
    if (!dataResponse || !dataResponse.includes('250')) {
      throw new Error('Email gönderilemedi: ' + dataResponse);
    }
    console.log('Email sent successfully');
    
    await write("QUIT\r\n");
    await read();
    
    conn.close();
    console.log('=== EMAIL SEND COMPLETED ===');
  } catch (error) {
    console.error('=== EMAIL SEND FAILED ===');
    console.error('Error:', error);
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
    console.log('=== VERIFICATION EMAIL FUNCTION CALLED ===');
    const { email, fullName, confirmationUrl }: VerificationEmailRequest = await req.json();
    console.log('Request data:', { email, fullName, confirmationUrl });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Adresinizi Doğrulayın</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Hoş Geldiniz!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Merhaba ${fullName},</p>
            
            <p>MiyoMint'e hoş geldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Email Adresimi Doğrula</a>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">⚠️ Eğer bu butona tıklayamadıysanız, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
            </div>
            
            <p style="font-size: 12px; word-break: break-all; color: #6b7280; background: #f9fafb; padding: 10px; border-radius: 4px;">${confirmationUrl}</p>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #166534;">✅ Email adresinizi doğruladıktan sonra hesabınıza giriş yapabilirsiniz.</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Bu link 24 saat geçerlidir.</p>
            
            <p style="margin-top: 30px;">Teşekkür ederiz,<br><strong>MiyoMint Ekibi</strong></p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            <p>Eğer bu hesabı siz oluşturmadıysanız, lütfen bu e-postayı görmezden gelin.</p>
            <p>&copy; 2024 MiyoMint. Tüm hakları saklıdır.</p>
          </div>
        </body>
      </html>
    `;

    console.log('Sending verification email...');
    await sendEmail(email, 'Email Adresinizi Doğrulayın - MiyoMint', emailHtml);
    console.log('Verification email sent');

    console.log('=== SUCCESS ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Email gönderilirken bir hata oluştu'
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