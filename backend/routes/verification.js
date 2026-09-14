import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import { accountNumberValidator, emailValidator, ninValidator, verificationTokenValidator } from "../validators/validators.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();


// EMAIL VERIFICATION
// Send verification link to email if not verified 
router.post("/send-verification-email", emailValidator, validate, authenticate, async (req, res) => {
    // --------------EMAIL CONFIGURATION-----------------
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate verification token (expires in 1 day)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send verification email 
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "RAN Exam App Email Verification",
      html: `
        <p>Hello ${user.name},</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;" target="_blank">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
        success: true,
        message: "Verification link sent to your email successfully! Please check your inbox.",
     });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify email using token
router.post("/verify-email", verificationTokenValidator, validate, async (req, res) => {
  try {
    // get token from the link query parameters
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if(user.isVerified) {
        return res.status(400).json({ error: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();
    res.json({ 
        success: true,
        message: "Email verified successfully!",
     });
  } catch (error) {
    console.log('Verify Email Error: ', error)
    res.status(500).json({ error: error.message });
  }
});



/**
 * @swagger
 * tags:
 *   - name: Verification
 *     description: Email verification endpoints
 *
 * /api/verification/send-verification-email:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Send a verification email to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification link sent successfully
 *       400:
 *         description: Email already verified or invalid request
 *
 * /api/verification/verify-email:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify an email address using a token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Verification token is required or invalid
 */
export default router;

