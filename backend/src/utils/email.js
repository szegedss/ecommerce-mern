const nodemailer = require('nodemailer');

// Cache for test account
let testAccount = null;

// Create transporter using SMTP
const createTransporter = async () => {
  // In development, use Ethereal if SMTP fails or not configured
  if (process.env.NODE_ENV === 'development' && process.env.USE_ETHEREAL === 'true') {
    if (!testAccount) {
      testAccount = await nodemailer.createTestAccount();
      console.log('📧 Ethereal test account created:', testAccount.user);
    }
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email helper function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'E-Commerce Store'}" <${process.env.SMTP_USER || 'noreply@ecommerce.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (testAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Preview URL:', previewUrl);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    
    // In development, don't fail registration if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Continuing despite email failure');
      console.log('💡 Tip: Add USE_ETHEREAL=true to .env for test emails');
      return { success: false, error: error.message, devMode: true };
    }
    
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  verifyEmail: (name, verifyUrl) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛒 E-Commerce Store</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for registering! Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Or copy this link: <a href="${verifyUrl}" style="color: #f97316;">${verifyUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 E-Commerce Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛒 E-Commerce Store</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello ${name}, we received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Or copy this link: <a href="${resetUrl}" style="color: #f97316;">${resetUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2025 E-Commerce Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  passwordChanged: (name) => ({
    subject: 'Your Password Has Been Changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛒 E-Commerce Store</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Password Changed Successfully</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello ${name}, your password has been successfully changed.
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            If you did not make this change, please contact our support team immediately.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 E-Commerce Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (name, orderNumber, items, total) => ({
    subject: `Order Confirmation #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🛒 E-Commerce Store</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Thank you for your order!</h2>
          <p style="color: #4b5563; font-size: 16px;">
            Hello ${name}, your order #${orderNumber} has been confirmed.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Order Details:</h3>
            ${items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #4b5563;">${item.name} x ${item.quantity}</span>
                <span style="color: #1f2937; font-weight: bold;">฿${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px;">
              <span style="color: #1f2937; font-weight: bold; font-size: 18px;">Total:</span>
              <span style="color: #f97316; font-weight: bold; font-size: 18px;">฿${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 E-Commerce Store. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter,
};
