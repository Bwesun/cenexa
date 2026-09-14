import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { loginValidator, passwordResetValidator, registerValidator } from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";
import nodemailer from "nodemailer";
import { emailValidator, userIdValidator } from "../validators/validators.js";

const router = express.Router();

// REGISTER USER
router.post("/register", authenticate, authorize("admin", "super"), registerValidator, validate, async (req, res) => {
  console.log("Registration endpoint hit", req.user);
  try {
    const { name, email, password, role, phone, ranNo, association, conference } = req.body;
    // console.log("Registration data received:", req.body);

    // Get organizationId from authenticated user
    const organizationId = req.user.organizationId;
    console.log("Authenticated user's organizationId:", organizationId);

    // Check if user already exists
    const existingUser = await User.findOne({ ranNo });
    if (existingUser) {
      return res.status(400).json({ error: "RAN Number already registered" });
    }

    // Create new user
    const user = new User({ name, email, password, role, phone, ranNo, association, conference, organizationId });
    await user.save();

    // const token = jwt.sign(
    //   {
    //     userId: user._id,
    //     name: user.name,
    //     role: user.role,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" },
    // );

    res.json({
      success: true,
      message: `User ${user.name} created successfully`,
      // token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        ranNo: user.ranNo,
        association: user.association,
        conference: user.conference
      },
    });
  } catch (error) {
    // console.log("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});


// LOGIN USER
router.post("/login", loginValidator, validate, async (req, res) => {
  try {
    const { ranNo, password } = req.body;

    const user = await User.findOne({ ranNo });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET CURRENT USER PROFILE
router.get("/me", authenticate, async (req, res) => {
  // console.log("Fetching user profile for user ID:", req);
  try {
    const user = await User.findById(req.user.userId).select("-password").select("-__v").select("-createdAt").select("-updatedAt");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ 
        success: true, 
        user
     });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
    // get userId from req.user set by authenticate middleware
  if (!req.user.userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    

    await user.save();
    res.status(200).json({
      success: true,
      message: `Profile updated successfully for user ${user.name}!`,
    //   user: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //     phone: user.phone,
    //     address: user.address,
    //     id_type: user.id_type,
    //     id_value: user.id_value,
    //   },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FORGOT PASSWORD
// send email with password reset link (tokenized) - token should expire after 1 hour
router.post("/forgot-password", emailValidator, validate, async (req, res) => {
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
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate verification token (expires in 1 day)
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "10m" }
        );

    // Send reset link email 
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "RAN Exam Account Password Reset",
      html: `
        <p>Hello ${user.name},</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;" target="_blank">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
        
    // send email with password reset link (tokenized) - token should expire after 10 minutes
    await transporter.sendMail(mailOptions);
    res.json({ 
        success: true,
        message: "Password reset link sent to email successfully! Please check your inbox.",
     });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", passwordResetValidator, validate, async (req, res) => {
    try{
        const { newPassword } = req.body;
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ error: "Account is deactivated. Please contact support." });
        }

        // Update user's password
        user.password = newPassword;
        await user.save();

        res.json({ 
            success: true,
            message: "Password reset successfully!",
         });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and profile endpoints
 *
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user under the authenticated admin or super admin organization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *               - role
 *               - ranNo
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               ranNo:
 *                 type: string
 *               association:
 *                 type: string
 *               conference:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Validation failed or RAN Number already registered
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with RAN number and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ranNo
 *               - password
 *             properties:
 *               ranNo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get the current authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       404:
 *         description: User not found
 *
 * /api/auth/profile:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request a password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password with token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
export default router;

