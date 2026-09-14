import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ============ USER MANAGEMENT ROUTES ============


// Get All Users, paginated - Super Admin
router.get('/super', authenticate, authorize("super"), async (req, res) => {
    try{
        const { search, page = 1, limit = 10, role } = req.query;
        const query = {};
        
        if (search) {
            query.$text = { $search: search };
        }
        if (role) {
            query.role = role;
        }
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("organizationId", "name organizationCode");
        
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);
        return res.status(200).json({ 
            users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
            },
            message: "Users fetched successfully",
         });
    } catch (error) {
        return res.status(500).json({ message: "Error getting users." });
    }
});

// Get All Users under authenticated user in the organization paginated with search term, limit and page query parameters - Admin only
router.get('/admin', authenticate, authorize("admin"), async (req, res) => {
    try{
        const { search, page = 1, limit = 10, role } = req.query;
        const query = {};
        
        if (search) {
            query.$text = { $search: search };
        }
        if (role) {
            query.role = role;
        }
        const users = await User.find({
            organizationId: req.user.organizationId,
            ...query,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalUsers = await User.countDocuments({ organizationId: req.user.organizationId, ...query });
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({ 
            users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
            },
            message: "Users fetched successfully",
         });
    } catch (error) {
    console.log("Error: ", error)
        return res.status(500).json({ message: "Error getting users." });
    }
});

// Get User by ID - Super & Admin only
router.get('/:id', authenticate, authorize("super", "admin"), async (req, res) => {
    try{
        const { id } = req.params;
        const user = await User.findById(id);

        // ===== ERROR CHECKS =====
        if(!user){
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // If user is admin and is requesting for any user not in the organization, return error
        if(req.user.role === "admin" && user.organizationId !== req.user.organizationId){
            return res.status(403).json({ success: false, error: "Unauthorized request" });
        }
        
        // ===== SUCCESS CHECKS ===== 
        // If user is super admin and is requesting for any user, return user
        if(req.user.role === "super"){
            return res.status(200).json({ success: true, user });
        }
        
        // If user is admin and is requesting for any user in the organization, return user
        if(req.user.role === "admin" && user.organizationId === req.user.organizationId){
            return res.status(200).json({ success: true, user });
        }

        return res.status(403).json({ success: false, error: "Unauthorized request" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error getting user." });
    }
});

// Update User - Super Admin
router.put('/super/:id', authenticate, authorize("super"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, phone, association, conference } = req.body;
        const user = await User.findById(id);
        
        if(!user){
            return res.status(404).json({ success: false, error: "User not found" });
        }
        if(!name || !email || !role || !phone){
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        if(user.role === "super"){
            return res.status(403).json({ success: false, error: "Unauthorized to update super admin" });
        }
        
        user.name = name;
        user.email = email;
        user.role = role;
        user.phone = phone;
        user.association = association;
        user.conference = conference;
        await user.save();
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Error updating user." });
    }
});

// Delete User - Super Admin
router.delete('/super/:id', authenticate, authorize("super"), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role === "super"){
            return res.status(403).json({ error: "Unauthorized to delete super admin" });
        }
        
        if(req.user.role === 'super') {
            const deleteUser = await User.findByIdAndDelete(id);
            return res.status(200).json({ message: "User deleted successfully" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error deleting user." });
    }
});

// Get User by ID - Admin only (belongs to authenticated user's organization)
router.get('/admin/:id', authenticate, authorize("admin", "super"), async (req, res) => {
    try{
        const { id } = req.params;
        const user = await User.findById(id);
        if(!user || user.organizationId !== req.user.organizationId){
            return res.status(403).json({ error: "Unauthorized" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error getting user." });
    }
});

// Create Admins - Super Admin
router.post('/super/create-admin', authenticate, authorize("super"), async (req, res) => {
    // TODO:: Add on frontend Organization to be assigned to the user creating the admin for
    const role = req.user.role;
    if(role !== "super"){
        return res.status(403).json({ error: "Unauthorized" });
    }
    const newRole = "admin";
    try{
        const { name, email, password, phone, ranNo, association, conference } = req.body;
        
    // validate input data
    if (!name || !password || !ranNo) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Get organizationId from authenticated user
    const organizationId = req.user.organizationId;
    console.log("Authenticated user's organizationId:", organizationId);

    // Check if user already exists
    const existingUser = await User.findOne({ ranNo });
    if (existingUser) {
      return res.status(400).json({ error: "User with this RAN Number already exists" });
    }

    // Create new user
    const user = new User({ name, email, password, role: newRole, phone, ranNo, association, conference, organizationId });
    await user.save();

    return res.status(201).json({ success: true, message: "User created successfully", userId: user._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error creating user." });
    }
});

// Create users  under authenticated user's organization (Admin creates examiners and candidates) Admins only
router.post('/admin/create-user', authenticate, authorize("admin"), async (req, res) => {
    if(!req.body.role === "examiner" || !req.body.role === "candidate"){
        return res.status(400).json({ success: false, message: "Bad Request: Invalid role", role: req.user.role });
    }
    try{
        const { name, email, password, phone, ranNo, association, conference, role } = req.body;
        
    // validate input data
    if (!name || !password || !ranNo) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Get organizationId from authenticated user
    const organizationId = req.user.organizationId;
    // console.log("Authenticated user's organizationId:", organizationId);

    // Check if user already exists
    const existingUser = await User.findOne({ ranNo });
    if (existingUser) {
      return res.status(400).json({ error: "User with this RAN Number already exists" });
    }

    // Create new user
    const user = new User({ name, email, password, role, phone, ranNo, association, conference, organizationId });
    await user.save();

    return res.status(201).json({ success: true, message: "User created successfully", userId: user._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error creating user." });
    }
});

// Update Admin - Super Admin
router.put('/super/update-admin', authenticate, authorize("super"), async (req, res) => {
    const role = req.user.role;
    if(role !== "super"){
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const { id } = req.params;
        const { name, email, role, phone, association, conference } = req.body;
        const user = await User.findById(id);
        
        if(!user || user.role !== "admin"){
            return res.status(403).json({ error: "Unauthorized to update admin" });
        }
        if(!name || !email || !role || !phone){
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        user.name = name;
        user.email = email;
        user.role = role;
        user.phone = phone;
        user.association = association;
        user.conference = conference;
        await user.save();
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error updating admin." });
    }
});

// Update User (only if belongs to authenticated user's organization)
router.put('/admin/update-user/:id', authenticate, authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, phone, association, conference } = req.body;
        const user = await User.findById(id);

        // make req.user.organizationId to objectId and compare
        if(!user || user.organizationId?.toString() !== req.user.organizationId){
            return res.status(403).json({ error: "Unauthorized" });
        }

        if(user.role === "super"){
            return res.status(403).json({ error: "Unauthorized to update super admin" });
        }
        if(req.user.role !== "super" && role === "admin"){
            return res.status(403).json({ error: "Unauthorized to update admin" });
        }
        if(!name || !email || !role || !phone){
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        user.name = name;
        user.email = email;
        user.role = role;
        user.phone = phone;
        user.association = association;
        user.conference = conference;
        await user.save();
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error updating user." });
    }
});

// Delete User (only if belongs to authenticated user's organization)
router.delete('/admin/:id', authenticate, authorize("admin", "super"), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if(!user || user.organizationId !== req.user.organizationId){
            return res.status(403).json({ error: "Unauthorized" });
        }
        if(user.role === "super"){
            return res.status(403).json({ error: "Unauthorized to delete super admin" });
        }
        if(req.user.role !== "super" && user.role === "admin"){
            return res.status(403).json({ error: "Unauthorized to delete admin" });
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user." });
    }
});

export default router;