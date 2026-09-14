import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import Organization from "../models/Organization.js";

const router = express.Router();

// ============ ORGANIZATION MANAGEMENT ROUTES ============
// Placeholder for organization routes (e.g., create, update, delete organizations)

// Get All Organizations, enable search, filter by active, status, and pagination - super admin only
router.get('/all', authenticate, authorize("super"), async (req, res) => {
    try{
        const { search = "", active, status, limit = "10", page = "1" } = req.query;
        const safeLimit = Math.min(parseInt(limit), 100);
        const safePage = Math.max(parseInt(page), 1);
        const skip = (safePage - 1) * safeLimit;

        let query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }  

        if (active !== undefined) {
            query.active = active === "true";
        }  

        const organizations = await Organization.find(query).limit(safeLimit).skip(skip);
        const totalOrganizations = await Organization.countDocuments(query);
        const totalPages = Math.ceil(totalOrganizations / safeLimit);

        res.status(200).json({
            success: true,
            data: organizations,
            pagination: {
                limit: safeLimit,
                page: safePage,
                totalPages,
                hasNextPage: safePage < totalPages,
                hasPrevPage: safePage > 1
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create Organization
router.post('/create', authenticate, authorize("super"), async (req, res) => {
    try {
        const { name, description } = req.body;
        const createdBy = req.user.userId; // Get the ID of the authenticated user

        const organization = new Organization({ name, description, createdBy });

        await organization.save();
        res.status(201).json({ success: true, data: organization, message: `${organization.name} organization created successfully` });
    } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).json({ success: false, message: "Error creating organization" });
    }
});

// Get Organization by ID
router.get('/:id', authenticate, authorize("super"), async (req, res) => {
    try{
        const { id } = req.params;
        const organization = await Organization.findById(id);

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Organization
router.put('/:id', authenticate, authorize("super"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const organization = await Organization.findByIdAndUpdate(
            id,
            { name, description, active },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete Organization
router.delete('/:id', authenticate, authorize("super"), async (req, res) => {
    try {
        const { id } = req.params;
        const organization = await Organization.findByIdAndDelete(id);

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * tags:
 *   - name: Organizations
 *     description: Organization administration endpoints
 *
 * /api/organization/all:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get all organizations for super admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Organizations list returned
 *
 * /api/organization/create:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create a new organization
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 *
 * /api/organization/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization returned
 *       404:
 *         description: Organization not found
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Update an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Delete an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 */
export default router;