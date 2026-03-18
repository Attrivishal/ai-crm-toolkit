import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validateWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspace.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Task from '../models/Task.js';
import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ==================== WORKSPACE CRUD ====================

// @route   GET /api/workspaces
// @desc    Get all workspaces for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        // Find workspaces where user is owner or member
        const workspaces = await Workspace.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        }).populate('owner', 'name email avatar');

        // Get stats for each workspace
        const workspacesWithStats = await Promise.all(workspaces.map(async (workspace) => {
            const totalLeads = await Lead.countDocuments({ workspaceId: workspace._id });
            const totalValue = await Lead.aggregate([
                { $match: { workspaceId: workspace._id } },
                { $group: { _id: null, total: { $sum: '$value' } } }
            ]);

            return {
                ...workspace.toObject(),
                stats: {
                    totalLeads,
                    totalValue: totalValue[0]?.total || 0,
                    activeMembers: workspace.members.length
                }
            };
        }));

        res.json({
            success: true,
            workspaces: workspacesWithStats
        });
    } catch (error) {
        console.error('Get workspaces error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch workspaces' 
        });
    }
});

// @route   GET /api/workspaces/:id
// @desc    Get single workspace by ID
// @access  Private
router.get('/:id', validateWorkspaceAccess, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        // Get workspace stats
        const totalLeads = await Lead.countDocuments({ workspaceId: workspace._id });
        const totalValue = await Lead.aggregate([
            { $match: { workspaceId: workspace._id } },
            { $group: { _id: null, total: { $sum: '$value' } } }
        ]);

        const response = {
            ...workspace.toObject(),
            stats: {
                totalLeads,
                totalValue: totalValue[0]?.total || 0,
                activeMembers: workspace.members.length
            }
        };

        res.json({
            success: true,
            workspace: response
        });
    } catch (error) {
        console.error('Get workspace error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch workspace' 
        });
    }
});

// @route   POST /api/workspaces
// @desc    Create new workspace
// @access  Private
router.post('/', [
    body('name', 'Workspace name is required')
        .not().isEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const { name } = req.body;
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

        // Create workspace
        const workspace = await Workspace.create({
            name,
      slug,
            owner: req.user._id,
            members: [{
                user: req.user._id,
                role: 'owner',
                joinedAt: new Date()
            }]
        });

        // Add workspace to user's workspaces
        await User.findByIdAndUpdate(req.user._id, {
            $push: { workspaces: { workspace: workspace._id, role: 'owner', joinedAt: new Date() } },
            $set: { defaultWorkspace: workspace._id }
        });

        res.status(201).json({
            success: true,
            message: 'Workspace created successfully',
            workspace
        });
    } catch (error) {
        console.error('Create workspace error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create workspace' 
        });
    }
});

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private (owner or admin only)
router.put('/:id', 
    validateWorkspaceAccess,
    requireWorkspaceRole(['owner', 'admin']),
    async (req, res) => {
        try {
            const { name,
      slug, settings } = req.body;

            const updateData = {};
            if (name) updateData.name = name;
            if (settings) updateData.settings = settings;

            const workspace = await Workspace.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Workspace updated successfully',
                workspace
            });
        } catch (error) {
            console.error('Update workspace error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to update workspace' 
            });
        }
    }
);

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private (owner only)
router.delete('/:id', 
    validateWorkspaceAccess,
    requireWorkspaceRole(['owner']),
    async (req, res) => {
        try {
            // Delete all workspace data
            await Promise.all([
                Lead.deleteMany({ workspaceId: req.params.id }),
                Task.deleteMany({ workspaceId: req.params.id }),
                Interaction.deleteMany({ workspaceId: req.params.id })
            ]);

            // Remove workspace from users
            await User.updateMany(
                { 'workspaces.workspace': req.params.id },
                { $pull: { workspaces: { workspace: req.params.id } } }
            );

            // Delete workspace
            await Workspace.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Workspace and all associated data deleted successfully'
            });
        } catch (error) {
            console.error('Delete workspace error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to delete workspace' 
            });
        }
    }
);

// ==================== MEMBER MANAGEMENT ====================

// @route   GET /api/workspaces/:id/members
// @desc    Get workspace members
// @access  Private
router.get('/:id/members', validateWorkspaceAccess, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('members.user', 'name email avatar role');

        res.json({
            success: true,
            members: workspace.members
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch members' 
        });
    }
});

// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private (owner or admin only)
router.post('/:id/members',
    validateWorkspaceAccess,
    requireWorkspaceRole(['owner', 'admin']),
    [
        body('email', 'Valid email is required').isEmail().normalizeEmail(),
        body('role', 'Role must be valid').isIn(['admin', 'member', 'viewer'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        try {
            const { email, role } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            // Check if user is already a member
            const workspace = await Workspace.findById(req.params.id);
            const isMember = workspace.members.some(
                m => m.user.toString() === user._id.toString()
            );

            if (isMember) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User is already a member of this workspace' 
                });
            }

            // Add to workspace
            workspace.members.push({
                user: user._id,
                role,
                joinedAt: new Date()
            });
            await workspace.save();

            // Add workspace to user's workspaces
            await User.findByIdAndUpdate(user._id, {
                $push: { workspaces: { workspace: workspace._id, role, joinedAt: new Date() } }
            });

            res.json({
                success: true,
                message: 'Member added successfully',
                member: { user, role }
            });
        } catch (error) {
            console.error('Add member error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to add member' 
            });
        }
    }
);

// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove member from workspace
// @access  Private (owner or admin only)
router.delete('/:id/members/:userId',
    validateWorkspaceAccess,
    requireWorkspaceRole(['owner', 'admin']),
    async (req, res) => {
        try {
            const workspace = await Workspace.findById(req.params.id);

            // Cannot remove owner
            if (workspace.owner.toString() === req.params.userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot remove workspace owner' 
                });
            }

            // Remove from workspace
            workspace.members = workspace.members.filter(
                m => m.user.toString() !== req.params.userId
            );
            await workspace.save();

            // Remove from user's workspaces
            await User.findByIdAndUpdate(req.params.userId, {
                $pull: { workspaces: { workspace: workspace._id } }
            });

            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        } catch (error) {
            console.error('Remove member error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to remove member' 
            });
        }
    }
);

// @route   PATCH /api/workspaces/:id/members/:userId
// @desc    Update member role
// @access  Private (owner or admin only)
router.patch('/:id/members/:userId',
    validateWorkspaceAccess,
    requireWorkspaceRole(['owner', 'admin']),
    [
        body('role', 'Role must be valid').isIn(['admin', 'member', 'viewer'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        try {
            const { role } = req.body;
            const workspace = await Workspace.findById(req.params.id);

            // Find and update member
            const member = workspace.members.find(
                m => m.user.toString() === req.params.userId
            );

            if (!member) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Member not found' 
                });
            }

            member.role = role;
            await workspace.save();

            // Update user's workspace role
            await User.updateOne(
                { 
                    _id: req.params.userId,
                    'workspaces.workspace': workspace._id
                },
                { $set: { 'workspaces.$.role': role } }
            );

            res.json({
                success: true,
                message: 'Member role updated successfully',
                member: { user: member.user, role }
            });
        } catch (error) {
            console.error('Update member role error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to update member role' 
            });
        }
    }
);

// ==================== WORKSPACE STATS ====================

// @route   GET /api/workspaces/:id/stats
// @desc    Get workspace statistics
// @access  Private
router.get('/:id/stats', validateWorkspaceAccess, async (req, res) => {
    try {
        const workspaceId = req.params.id;

        // Get leads stats
        const totalLeads = await Lead.countDocuments({ workspaceId });
        const leadsByStatus = await Lead.aggregate([
            { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalValue = await Lead.aggregate([
            { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
            { $group: { _id: null, total: { $sum: '$value' } } }
        ]);

        // Get tasks stats
        const tasksByStatus = await Task.aggregate([
            { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get interactions stats
        const recentActivity = await Interaction.find({ workspaceId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('leadId', 'name company')
            .populate('userId', 'name avatar');

        res.json({
            success: true,
            stats: {
                leads: {
                    total: totalLeads,
                    byStatus: leadsByStatus,
                    totalValue: totalValue[0]?.total || 0
                },
                tasks: {
                    byStatus: tasksByStatus
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Workspace stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch workspace stats' 
        });
    }
});

export default router;
