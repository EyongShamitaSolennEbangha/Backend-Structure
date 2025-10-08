// Simple email service using nodemailer
import nodemailer from 'nodemailer';

// Create a transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For development without real email, we'll log to console
export const sendBookingConfirmationEmail = async (booking) => {
  try {
    const { clientId, providerId, eventDetails, serviceDetails } = booking;
    
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: clientId.email,
      subject: `Booking Confirmed! - ${eventDetails.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">🎉 Your Booking Has Been Confirmed!</h2>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${eventDetails.eventName}</p>
            <p><strong>Date:</strong> ${new Date(eventDetails.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${eventDetails.eventTime || 'To be confirmed'}</p>
            <p><strong>Location:</strong> ${eventDetails.location}</p>
            <p><strong>Guests:</strong> ${eventDetails.guestCount}</p>
          </div>

          <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Service Provider:</h3>
            <p><strong>Provider:</strong> ${providerId.firstName} ${providerId.lastName}</p>
            <p><strong>Company:</strong> ${providerId.companyName}</p>
            <p><strong>Email:</strong> ${providerId.email}</p>
            <p><strong>Phone:</strong> ${providerId.phone}</p>
          </div>

          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Details:</h3>
            <p><strong>Total Amount:</strong> $${serviceDetails.totalAmount}</p>
          </div>

          <p>Your service provider will contact you soon to discuss the next steps.</p>
          
          <p>Best regards,<br>The EventPro Team</p>
        </div>
      `
    };

    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 BOOKING CONFIRMATION EMAIL:');
      console.log('To:', clientId.email);
      console.log('Subject:', emailContent.subject);
      console.log('Content:', emailContent.html);
      return true;
    } else {
      await transporter.sendMail(emailContent);
      return true;
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

export const sendBookingDeclinedEmail = async (booking, reason) => {
  try {
    const { clientId, providerId, eventDetails } = booking;
    
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: clientId.email,
      subject: `Booking Update - ${eventDetails.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Booking Request Update</h2>
          
          <p>We're sorry to inform you that your booking request has been declined by the service provider.</p>

          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${eventDetails.eventName}</p>
            <p><strong>Date:</strong> ${new Date(eventDetails.eventDate).toLocaleDateString()}</p>
            <p><strong>Provider:</strong> ${providerId.firstName} ${providerId.lastName}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <p>Don't worry! You can search for other available service providers who might be able to help with your event.</p>
          
          <p>Best regards,<br>The EventPro Team</p>
        </div>
      `
    };

    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 BOOKING DECLINED EMAIL:');
      console.log('To:', clientId.email);
      console.log('Subject:', emailContent.subject);
      console.log('Content:', emailContent.html);
      return true;
    } else {
      await transporter.sendMail(emailContent);
      return true;
    }
  } catch (error) {
    console.error('Error sending declined email:', error);
    throw error;
  }
};