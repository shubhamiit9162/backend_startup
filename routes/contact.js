const express = require("express");
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Submit contact form
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Create contact record
    const contact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await contact.save();

    // Send email notification to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "hello@souvenohub.com",
      subject: `New Contact Form Submission - ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Souveno Hub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Thank you for contacting Souveno Hub!</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
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
      message: "Contact form submitted successfully",
      id: contact._id,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({
      message: "Error submitting contact form",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Get all contacts (admin only)
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-ipAddress -userAgent");

    const total = await Contact.countDocuments(filter);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      message: "Error fetching contacts",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Update contact status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact status updated", contact });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      message: "Error updating contact status",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

module.exports = router;
