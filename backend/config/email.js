// backend/config/email.js

const nodemailer = require('nodemailer');

// Configure email transporter
// For development, you can use ethereal.email (fake email service for testing)
// For production, use your actual email service (Gmail, SendGrid, etc.)

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASS || 'your-password'
  }
});

// For Gmail (production):
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const sendResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Basketball Portfolio" <${process.env.EMAIL_FROM || 'noreply@basketballportfolio.com'}>`,
    to: email,
    subject: 'Password Reset Request - Basketball Portfolio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #17395f;">🏀 Basketball Portfolio</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #17395f;">Password Reset Request</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password for your Basketball Portfolio account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #E68C3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request - Basketball Portfolio
      
      Hello ${userName},
      
      We received a request to reset your password.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = { sendResetEmail };