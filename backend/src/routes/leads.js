import express from 'express';
import { body, validationResult } from 'express-validator';
import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';
import { protect } from '../middleware/auth.js';
import { validateWorkspaceAccess } from '../middleware/workspace.js';

const router = express.Router();

// Apply authentication and workspace validation to all routes
router.use(protect);
router.use(validateWorkspaceAccess);

// @route   GET /api/leads
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Build query - workspaceId is optional now
        const query = { userId: req.user._id };
        
        // Add workspaceId to query if available
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { name: searchRegex },
                { company: searchRegex },
                { email: searchRegex }
            ];
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by industry
        if (req.query.industry) {
            query.industry = req.query.industry;
        }

        // Sort options
        let sort = { createdAt: -1 };
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { [sortField]: sortOrder };
        }

        const total = await Lead.countDocuments(query);
        const leads = await Lead.find(query)
            .skip(startIndex)
            .limit(limit)
            .sort(sort);

        // Get interaction counts for each lead
        const leadsWithStats = await Promise.all(leads.map(async (lead) => {
            const interactionQuery = { leadId: lead._id };
            if (req.workspaceId) {
                interactionQuery.workspaceId = req.workspaceId;
            }
            
            const interactionCount = await Interaction.countDocuments(interactionQuery);
            const lastInteraction = await Interaction.findOne(interactionQuery)
                .sort({ createdAt: -1 });

            return {
                ...lead.toObject(),
                interactionCount,
                lastInteraction: lastInteraction?.createdAt || null
            };
        }));

        res.json({
            success: true,
            count: leads.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            leads: leadsWithStats
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/leads/:id
router.get('/:id', async (req, res) => {
    try {
        const query = { _id: req.params.id, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        const lead = await Lead.findOne(query);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Get interactions for this lead
        const interactionQuery = { leadId: lead._id };
        if (req.workspaceId) {
            interactionQuery.workspaceId = req.workspaceId;
        }
        
        const interactions = await Interaction.find(interactionQuery)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            lead: {
                ...lead.toObject(),
                interactions
            }
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/leads
router.post('/', [
    body('name', 'Name is required').not().isEmpty().trim(),
    body('company', 'Company is required').not().isEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('industry', 'Industry is required').not().isEmpty().trim(),
    body('value', 'Value must be a number').optional().isNumeric(),
    body('notes', 'Notes must be a string').optional().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if lead already exists
        const query = { email: req.body.email, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        const existingLead = await Lead.findOne(query);

        if (existingLead) {
            return res.status(400).json({
                message: 'A lead with this email already exists'
            });
        }

        const leadData = {
            ...req.body,
            userId: req.user._id,
            leadScore: 0
        };
        
        if (req.workspaceId) {
            leadData.workspaceId = req.workspaceId;
        }

        const lead = await Lead.create(leadData);

        // Create initial interaction
        const interactionData = {
            leadId: lead._id,
            userId: req.user._id,
            type: 'Note',
            notes: 'Lead created'
        };
        
        if (req.workspaceId) {
            interactionData.workspaceId = req.workspaceId;
        }
        
        await Interaction.create(interactionData);

        res.status(201).json({ success: true, lead });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/leads/:id
router.put('/:id', async (req, res) => {
    try {
        const query = { _id: req.params.id, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        let lead = await Lead.findOne(query);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Don't allow updating certain fields
        const { userId, workspaceId, ...updateData } = req.body;

        lead = await Lead.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
    try {
        const query = { _id: req.params.id, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        const lead = await Lead.findOne(query);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Delete all interactions first
        const interactionQuery = { leadId: lead._id };
        if (req.workspaceId) {
            interactionQuery.workspaceId = req.workspaceId;
        }
        
        await Interaction.deleteMany(interactionQuery);

        // Then delete the lead
        await lead.deleteOne();

        res.json({ success: true, message: 'Lead and associated interactions removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/leads/:id/status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['New Lead', 'Contacted', 'Qualified', 'Demo Scheduled', 'Proposal Sent', 'Closed Won', 'Closed Lost'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const query = { _id: req.params.id, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        let lead = await Lead.findOne(query);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const oldStatus = lead.status;
        lead.status = status;
        await lead.save();

        // Create interaction for status change
        const interactionData = {
            leadId: lead._id,
            userId: req.user._id,
            type: 'Note',
            notes: `Status changed from ${oldStatus} to ${status}`
        };
        
        if (req.workspaceId) {
            interactionData.workspaceId = req.workspaceId;
        }
        
        await Interaction.create(interactionData);

        res.json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/leads/:id/analyze
router.post('/:id/analyze', async (req, res) => {
    try {
        const query = { _id: req.params.id, userId: req.user._id };
        if (req.workspaceId) {
            query.workspaceId = req.workspaceId;
        }
        
        const lead = await Lead.findOne(query);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Forward to AI service
        const response = await fetch(`${process.env.API_URL}/api/ai/analyze-lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            body: JSON.stringify({
                leadId: lead._id,
                industry: lead.industry,
                notes: lead.notes,
                company: lead.company,
                workspaceId: req.workspaceId
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
