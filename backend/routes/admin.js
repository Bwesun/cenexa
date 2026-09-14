import express from "express";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
    getAllUsersValidator,
    userIdParamValidator,
    updateUserRoleValidator,
    updateUserStatusValidator,
    updateUserProfileValidator,
    getReportValidator,
} from "../validators/adminValidator.js";
import Exam from "../models/Exams.js";
import Question from "../models/Questions.js";

const router = express.Router();

// ============ MIDDLEWARE ============
// All admin routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize("admin"));

// ============ ADMIN ROUTES ============
router.get("/dashboard-stats", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const query = {};
        if (organizationId) {
            query.organizationId = organizationId;
        }
        const totalUsers = await User.countDocuments(query);
        const totalExams = await Exam.countDocuments(query);
        const totalQuestions = await Question.countDocuments(query);
        const activeUsers = await User.countDocuments({ isActive: true, ...query });
        const inactiveUsers = await User.countDocuments({ isActive: false, ...query });
        const adminUsers = await User.countDocuments({ role: "admin", ...query });
        const examinerUsers = await User.countDocuments({ role: "examiner", ...query });
        const candidateUsers = await User.countDocuments({ role: "candidate", ...query });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalExams,
                totalQuestions,
                activeUsers,
                inactiveUsers,
                byRole: {
                    admin: adminUsers,
                    examiner: examinerUsers,
                    candidate: candidateUsers,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ========= SYSTEM HEALTH ========
// GET system health
router.get("/system/health", async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const query = {};
        if (organizationId) {
            query.organizationId = organizationId;
        }
        const dbHealth = {
            users: await User.countDocuments(query),
            exams: await Exam.countDocuments(query),
            questions: await Question.countDocuments(query),
        };

        res.json({
            success: true,
            message: "System is healthy",
            data: {
                timestamp: new Date(),
                database: dbHealth,
                status: "operational",
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "System health check failed",
            error: error.message,
        });
    }
});

// ============ USER MANAGEMENT ROUTES ============

// // GET all users with pagination and filtering
// router.get("/users", getAllUsersValidator, validate, async (req, res) => {
//     try {
//         const { page = 1, limit = 10, role, status } = req.query;
//         const skip = (page - 1) * limit;

//         const filter = {};
//         if (role) filter.role = role;
//         if (status) filter.isActive = status === "active";

//         const users = await User.find(filter)
//             .select("-password")
//             .skip(skip)
//             .limit(parseInt(limit))
//             .sort({ createdAt: -1 });

//         const total = await User.countDocuments(filter);

//         res.json({
//             success: true,
//             data: users,
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total,
//                 pages: Math.ceil(total / limit),
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // GET user statistics
// router.get("/users/stats", async (req, res) => {
//     console.log("User details: ", req.user);
//     try {
//         const totalUsers = await User.countDocuments();
//         const activeUsers = await User.countDocuments({ isActive: true });
//         const inactiveUsers = await User.countDocuments({ isActive: false });
//         const adminUsers = await User.countDocuments({ role: "admin" });
//         const individualUsers = await User.countDocuments({ role: "individual" });
//         const businessUsers = await User.countDocuments({ role: "business" });
//         const verifiedUsers = await User.countDocuments({ isVerified: true });
//         const unverifiedUsers = await User.countDocuments({ isVerified: false });

//         res.json({
//             success: true,
//             data: {
//                 totalUsers,
//                 activeUsers,
//                 inactiveUsers,
//                 byRole: {
//                     admin: adminUsers,
//                     individual: individualUsers,
//                     business: businessUsers,
//                 },
//                 verification: {
//                     verified: verifiedUsers,
//                     unverified: unverifiedUsers,
//                 },
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // GET user by ID
// router.get("/users/:userId", userIdParamValidator, validate, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const user = await User.findById(userId).select("-password");

//         if (!user) {
//             return res.status(404).json({ success: false, error: "User not found" });
//         }

//         res.json({ success: true, data: user });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // UPDATE user role
// router.put("/users/:userId/role", updateUserRoleValidator, validate, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { role } = req.body;

//         const user = await User.findByIdAndUpdate(
//             userId,
//             { role },
//             { new: true, runValidators: true }
//         ).select("-password");

//         if (!user) {
//             return res.status(404).json({ success: false, error: "User not found" });
//         }

//         res.json({
//             success: true,
//             message: "User role updated successfully",
//             data: user,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });


// // UPDATE user status (activate/deactivate)
// router.put("/users/:userId/status", updateUserStatusValidator, validate, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { isActive } = req.body;

//         const user = await User.findByIdAndUpdate(
//             userId,
//             { isActive },
//             { new: true, runValidators: true }
//         ).select("-password");

//         if (!user) {
//             return res.status(404).json({ success: false, error: "User not found" });
//         }

//         res.json({
//             success: true,
//             message: `User ${isActive ? "activated" : "deactivated"} successfully`,
//             data: user,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // UPDATE user profile
// router.put("/users/:userId/profile", updateUserProfileValidator, validate, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { name, phone, address, avatar } = req.body;

//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phone) updateData.phone = phone;
//         if (address) updateData.address = address;
//         if (avatar) updateData.avatar = avatar;

//         const user = await User.findByIdAndUpdate(
//             userId,
//             updateData,
//             { new: true, runValidators: true }
//         ).select("-password");

//         if (!user) {
//             return res.status(404).json({ success: false, error: "User not found" });
//         }

//         res.json({
//             success: true,
//             message: "User profile updated successfully",
//             data: user,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // DELETE user
// router.delete("/users/:userId", userIdParamValidator, validate, async (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Delete user and associated wallet
//         await User.findByIdAndDelete(userId);
//         await Wallet.deleteOne({ user: userId });

//         res.json({
//             success: true,
//             message: "User deleted successfully",
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // ============ VERIFICATION MANAGEMENT ROUTES ============

// // GET pending verifications
// router.get("/verifications/pending", async (req, res) => {
//     try {
//         const pendingNin = await User.find({
//             "verification.nin.nin_number": { $ne: null },
//             "verification.nin.nin_verified": false,
//         }).select("_id name email verification");

//         const pendingCac = await User.find({
//             "verification.cac.cac_no": { $ne: null },
//             "verification.cac.cac_verified": false,
//         }).select("_id name email verification");

//         const pendingAccount = await User.find({
//             "verification.account_number.account_number": { $ne: null },
//             "verification.account_number.account_verified": false,
//         }).select("_id name email verification");

//         res.json({
//             success: true,
//             data: {
//                 pendingNin,
//                 pendingCac,
//                 pendingAccount,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// ============ SYSTEM MANAGEMENT ROUTES ============
// // GET system statistics/dashboard stats
// router.get("/statistics", async (req, res) => {
//     try {
//         const totalUsers = await User.countDocuments();
//         const totalTransactions = await Transaction.countDocuments();
//         const totalWallets = await Wallet.countDocuments();

//         const activeUsers = await User.countDocuments({ isActive: true });
//         const completedTransactions = await Transaction.countDocuments({ status: "completed" });

//         const walletStats = await Wallet.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     totalBalance: { $sum: "$balance" },
//                 },
//             },
//         ]);

//         const transactionVolume = await Transaction.aggregate([
//             { $match: { status: "completed" } },
//             {
//                 $group: {
//                     _id: null,
//                     totalVolume: { $sum: "$amount" },
//                 },
//             },
//         ]);

//         res.json({
//             success: true,
//             data: {
//                 users: {
//                     total: totalUsers,
//                     active: activeUsers,
//                     inactive: totalUsers - activeUsers,
//                 },
//                 transactions: {
//                     total: totalTransactions,
//                     completed: completedTransactions,
//                     pending: await Transaction.countDocuments({ status: "pending" }),
//                     failed: await Transaction.countDocuments({ status: "failed" }),
//                 },
//                 wallets: {
//                     total: totalWallets,
//                     totalBalance: walletStats[0]?.totalBalance || 0,
//                 },
//                 volume: {
//                     totalTransactionVolume: transactionVolume[0]?.totalVolume || 0,
//                 },
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });



// // GET transaction report
// router.get("/reports/transactions", getReportValidator, validate, async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;

//         const filter = {};
//         if (startDate || endDate) {
//             filter.date = {};
//             if (startDate) filter.date.$gte = new Date(startDate);
//             if (endDate) filter.date.$lte = new Date(endDate);
//         }

//         const report = await Transaction.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$type",
//                     count: { $sum: 1 },
//                     totalAmount: { $sum: "$amount" },
//                     avgAmount: { $avg: "$amount" },
//                 },
//             },
//         ]);

//         const statusReport = await Transaction.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$status",
//                     count: { $sum: 1 },
//                     totalAmount: { $sum: "$amount" },
//                 },
//             },
//         ]);

//         res.json({
//             success: true,
//             data: {
//                 period: {
//                     from: startDate || "All time",
//                     to: endDate || "Present",
//                 },
//                 byType: report,
//                 byStatus: statusReport,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // GET user activity report
// router.get("/reports/users", getReportValidator, validate, async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;

//         const filter = {};
//         if (startDate || endDate) {
//             filter.createdAt = {};
//             if (startDate) filter.createdAt.$gte = new Date(startDate);
//             if (endDate) filter.createdAt.$lte = new Date(endDate);
//         }

//         const userReport = await User.aggregate([
//             { $match: filter },
//             {
//                 $group: {
//                     _id: "$role",
//                     count: { $sum: 1 },
//                     verified: {
//                         $sum: { $cond: ["$isVerified", 1, 0] },
//                     },
//                     active: {
//                         $sum: { $cond: ["$isActive", 1, 0] },
//                     },
//                 },
//             },
//         ]);

//         res.json({
//             success: true,
//             data: {
//                 period: {
//                     from: startDate || "All time",
//                     to: endDate || "Present",
//                 },
//                 byRole: userReport,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

export default router;
