import express from 'express';
import { body, validationResult } from 'express-validator';
import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/leads
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const query = { userId: req.user._id };
        
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
            const interactionCount = await Interaction.countDocuments({ leadId: lead._id });
            const lastInteraction = await Interaction.findOne({ leadId: lead._id })
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
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        if (lead.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Get interactions for this lead
        const interactions = await Interaction.find({ leadId: lead._id })
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
        const existingLead = await Lead.findOne({ 
            email: req.body.email,
            userId: req.user._id 
        });
        
        if (existingLead) {
            return res.status(400).json({ 
                message: 'A lead with this email already exists' 
            });
        }

        const leadData = { 
            ...req.body, 
            userId: req.user._id,
            leadScore: 0 // Initialize with 0, will be updated by AI
        };
        
        const lead = await Lead.create(leadData);

        // Create initial interaction
        await Interaction.create({
            leadId: lead._id,
            userId: req.user._id,
            type: 'Note',
            notes: 'Lead created'
        });

        res.status(201).json({ success: true, lead });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/leads/:id
router.put('/:id', async (req, res) => {
    try {
        let lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        if (lead.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Don't allow updating certain fields
        const { userId, ...updateData } = req.body;

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
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        if (lead.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete all interactions first
        await Interaction.deleteMany({ leadId: lead._id });
        
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
        let lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        if (lead.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const oldStatus = lead.status;
        lead.status = status;
        await lead.save();

        // Create interaction for status change
        await Interaction.create({
            leadId: lead._id,
            userId: req.user._id,
            type: 'Note',
            notes: `Status changed from ${oldStatus} to ${status}`
        });

        res.json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/leads/:id/analyze
router.post('/:id/analyze', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        if (lead.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
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
                company: lead.company
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;