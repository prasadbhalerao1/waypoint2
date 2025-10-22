/**
 * Email Utility
 * Send booking confirmations and notifications
 */

import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  // Use Gmail SMTP when explicitly configured
  if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📧 Email: Using Gmail SMTP with', process.env.EMAIL_USER);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  // Default: use stream transport which writes the email to a buffer (good for development)
  console.log('📧 Email: Using stream transport (development mode or no Gmail credentials configured)');
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
};

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(bookingData) {
  const { studentEmail, counsellorName, start, end, bookingId } = bookingData;
  
  const transporter = createTransporter();
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = `${startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })} - ${endDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .booking-card {
          background: #f9fafb;
          border-left: 4px solid #14b8a6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .booking-detail {
          margin: 10px 0;
          display: flex;
          align-items: center;
        }
        .booking-detail strong {
          min-width: 120px;
          color: #0891b2;
        }
        .button {
          display: inline-block;
          background: #14b8a6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-radius: 0 0 10px 10px;
        }
        .important-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .icon {
          font-size: 24px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌟 WayPoint - Booking Confirmed</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mental health matters</p>
      </div>
      
      <div class="content">
        <h2 style="color: #0891b2;">✅ Your Counseling Session is Confirmed!</h2>
        
        <p>Dear Student,</p>
        
        <p>Great news! Your counseling session has been successfully booked. Taking this step shows strength and self-awareness.</p>
        
        <div class="booking-card">
          <h3 style="margin-top: 0; color: #0891b2;">📅 Session Details</h3>
          
          <div class="booking-detail">
            <strong>Booking ID:</strong>
            <span>${bookingId}</span>
          </div>
          
          <div class="booking-detail">
            <strong>Counselor:</strong>
            <span>${counsellorName || 'Professional Counselor'}</span>
          </div>
          
          <div class="booking-detail">
            <strong>Date:</strong>
            <span>${formattedDate}</span>
          </div>
          
          <div class="booking-detail">
            <strong>Time:</strong>
            <span>${formattedTime}</span>
          </div>
        </div>
        
        <div class="important-note">
          <strong>⏰ Important Reminders:</strong>
          <ul style="margin: 10px 0 0 0; padding-left: 20px;">
            <li>Please join 5 minutes before your scheduled time</li>
            <li>Ensure you're in a quiet, private space</li>
            <li>Have a stable internet connection</li>
            <li>Keep your session link/details confidential</li>
          </ul>
        </div>
        
        <h3 style="color: #0891b2;">What to Expect:</h3>
        <ul>
          <li><strong>Confidential:</strong> Everything discussed remains private</li>
          <li><strong>Non-judgmental:</strong> A safe space to express yourself</li>
          <li><strong>Professional:</strong> Trained counselor to guide you</li>
          <li><strong>Supportive:</strong> Focus on your wellbeing and growth</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/booking" class="button">
            View My Bookings
          </a>
        </div>
        
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <strong>Need to reschedule?</strong> Please contact us at least 24 hours before your session.
        </p>
      </div>
      
      <div class="footer">
        <p><strong>WayPoint - Your Campus Mental Health Companion</strong></p>
        <p>This is an automated message. Please do not reply to this email.</p>
        <p style="margin-top: 10px;">
          If you're in crisis, please call:<br>
          🆘 KIRAN: 1800-599-0019 | Vandrevala Foundation: 9999 666 555
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
WayPoint - Booking Confirmed

Your counseling session has been successfully booked!

Session Details:
- Booking ID: ${bookingId}
- Counselor: ${counsellorName || 'Professional Counselor'}
- Date: ${formattedDate}
- Time: ${formattedTime}

Important Reminders:
- Join 5 minutes before your scheduled time
- Ensure you're in a quiet, private space
- Have a stable internet connection

What to Expect:
- Confidential and non-judgmental environment
- Professional guidance and support
- Focus on your wellbeing and growth

View your bookings: ${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/booking

Need help? Contact us at least 24 hours before your session to reschedule.

---
WayPoint - Your Campus Mental Health Companion
Crisis Helplines: KIRAN 1800-599-0019 | Vandrevala 9999 666 555
  `;

  const mailOptions = {
    from: `"WayPoint Support" <${process.env.EMAIL_USER || 'waypointplatform@gmail.com'}>`,
    to: studentEmail,
    subject: '✅ Counseling Session Confirmed - WayPoint',
    text: textContent,
    html: htmlContent,
    replyTo: 'waypointplatform@gmail.com'
  };

  try {
    console.log('📧 Attempting to send email to:', studentEmail);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    // For development (console transport)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email Preview:');
      console.log('To:', studentEmail);
      console.log('Subject:', mailOptions.subject);
      console.log('---');
      console.log(textContent);
      console.log('---');
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send booking reminder (24 hours before)
 */
export async function sendBookingReminder(bookingData) {
  const { studentEmail, counsellorName, start, bookingId } = bookingData;
  
  const transporter = createTransporter();
  
  const startDate = new Date(start);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #14b8a6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⏰ Session Reminder - Tomorrow!</h1>
      </div>
      <div class="content">
        <h2>Your counseling session is tomorrow</h2>
        <div class="reminder-box">
          <strong>Session Details:</strong><br>
          Booking ID: ${bookingId}<br>
          Counselor: ${counsellorName || 'Professional Counselor'}<br>
          Time: ${startDate.toLocaleString('en-IN')}
        </div>
        <p>Please ensure you're ready 5 minutes before the session.</p>
        <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/booking" class="button">View Details</a>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"WayPoint Support" <${process.env.EMAIL_USER || 'noreply@waypoint.app'}>`,
    to: studentEmail,
    subject: '⏰ Reminder: Counseling Session Tomorrow - WayPoint',
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Reminder email failed:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendBookingConfirmation,
  sendBookingReminder
};
