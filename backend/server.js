import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authenticate } from './middleware/auth.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerSpec from "./swagger.js";

// Import routes
import authRoutes from "./routes/auth.js"
import verificationRoutes from "./routes/verification.js"
import adminRoutes from "./routes/admin.js";
import examRoutes from "./routes/exam.js";
import questionRoutes from "./routes/question.js";
import organizationRoutes from "./routes/organization.js";
import candidateExamRoutes from "./routes/candidateExam.js";
import resultRoutes from "./routes/result.js";
import userRoutes from "./routes/user.js";
import multer from "multer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet()); 
app.set('trust proxy', 1); // Trust proxy if behind one (like Render or Heroku)

// Global Rate limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, // 10mins
    max: 100,
    message: "Too many requests from this IP, please try again later.",
});

// add global rate limiting according to individual user IP
// const limiter = rateLimit({
//     windowMs: 10*60*1000, // 10mins
//     max: 100,
//     message: "Too many requests from this IP, please try again later.",
//     keyGenerator: (req) => {
//         return req.user ? req.user.userId : req.ip; // Use user ID if authenticated, otherwise use IP
//     }
// });

app.use(limiter);

// Connect to MondoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to RAN Exam Database!'))
    .catch((error) => console.error('Error connecting to RAN Exam Database: ', error));

// Multer error handling
app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        switch (err.code) {

            case "LIMIT_FILE_SIZE":
                return res.status(400).json({
                    success: false,
                    message: "Maximum file size is 5MB.",
                });

            case "LIMIT_UNEXPECTED_FILE":
                return res.status(400).json({
                    success: false,
                    message: "Only one CSV file can be uploaded.",
                });

            default:
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
        }

    }

    if (err.message === "Only CSV (.csv) files are allowed.") {

        return res.status(400).json({
            success: false,
            message: err.message,
        });

    }

    next(err);
});


// API Routes
// Test Backend
app.get("/", (req, res) => {
    res.send("RAN Exam App backend is Running!");
})

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/candidate", candidateExamRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// Serve Swagger UI
app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// Start the server
app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}`));