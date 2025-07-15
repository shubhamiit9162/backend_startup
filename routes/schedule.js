const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule"); // Adjust path as needed
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceType,
      preferredDate,
      preferredTime,
      message,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !serviceType ||
      !preferredDate ||
      !preferredTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Check if time slot is already booked
    const existingSchedule = await Schedule.findOne({
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime,
      status: { $ne: "cancelled" },
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    // Create new schedule
    const schedule = new Schedule({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company ? company.trim() : "",
      serviceType: serviceType.trim(),
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime,
      message: message ? message.trim() : "",
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    const savedSchedule = await schedule.save();

    // Send email notification to admin/owner
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "hello@souvenohub.com",
      subject: `New Call Scheduled - ${serviceType}`,
      html: `
        <h2>New Call Scheduled</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || "Not provided"}</p>
        <p><strong>Service Type:</strong> ${serviceType}</p>
        <p><strong>Preferred Date:</strong> ${new Date(
          preferredDate
        ).toLocaleDateString()}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        <p><strong>Message:</strong></p>
        <p>${
          message ? message.replace(/\n/g, "<br>") : "No message provided"
        }</p>
        <p><strong>Scheduled at:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Call Scheduled Successfully - Souveno Hub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Call Scheduled Successfully!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for scheduling a call with Souveno Hub. We have received your request and will contact you at the scheduled time.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <p><strong>Service Type:</strong> ${serviceType}</p>
            <p><strong>Date:</strong> ${new Date(
              preferredDate
            ).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${preferredTime}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
            ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ""}
          </div>
          <p>If you need to reschedule or have any questions, please contact us.</p>
          <p>Best regards,<br>Souveno Hub Team</p>
        </div>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    res.status(201).json({
      success: true,
      message: "Call scheduled successfully",
      data: {
        id: savedSchedule._id,
        name: savedSchedule.name,
        email: savedSchedule.email,
        preferredDate: savedSchedule.preferredDate,
        preferredTime: savedSchedule.preferredTime,
        status: savedSchedule.status,
      },
    });
  } catch (error) {
    console.error("Schedule creation error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

module.exports = router;
