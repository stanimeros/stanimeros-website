const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

setGlobalOptions({ maxInstances: 10 });

// Gmail transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = onCall(async (request) => {
  try {
    const { name, email, message } = request.data;

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from your website contact form</em></p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    logger.info("Email sent successfully", { name, email });
    return { success: true, message: "Email sent successfully" };
    
  } catch (error) {
    logger.error("Error sending email", error);
    throw new Error("Failed to send email");
  }
});
