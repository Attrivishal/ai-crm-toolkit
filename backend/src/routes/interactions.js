import express from 'express';
import { body, validationResult, param, query } from 'express-validator';
import Interaction from '../models/Interaction.js';
import Lead from '../models/Lead.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all interaction routes
router.use(protect);

// @route   GET /api/interactions
router.get('/', [
    query('leadId').optional().isMongoId().withMessage('Invalid lead ID'),
    query('type').optional().isIn(['Email', 'Call', 'Meeting', 'Note', 'Demo', 'Task', 'Status Change', 'Proposal Sent']),
    query('sentiment').optional().isIn(['Positive', 'Neutral', 'Negative']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const { 
            leadId, 
            type, 
            sentiment,
            limit = 50,
            page = 1,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = { userId: req.user._id };
        
        if (leadId) query.leadId = leadId;
        if (type) query.type = type;
        if (sentiment) query.sentiment = sentiment;
        
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const interactions = await Interaction.find(query)
            .populate('leadId', 'name company email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count
        const total = await Interaction.countDocuments(query);

        // Get summary statistics
        const stats = await Interaction.aggregate([
            { $match: { userId: req.user._id } },
            { $group: {
                _id: null,
                totalInteractions: { $sum: 1 },
                emails: { $sum: { $cond: [{ $eq: ['$type', 'Email'] }, 1, 0] } },
                calls: { $sum: { $cond: [{ $eq: ['$type', 'Call'] }, 1, 0] } },
                meetings: { $sum: { $cond: [{ $eq: ['$type', 'Meeting'] }, 1, 0] } },
                positiveSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
                neutralSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } },
                negativeSentiment: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } }
            }}
        ]);

        res.json({
            success: true,
            count: interactions.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            stats: stats[0] || {
                totalInteractions: 0,
                emails: 0,
                calls: 0,
                meetings: 0,
                positiveSentiment: 0,
                neutralSentiment: 0,
                negativeSentiment: 0
            },
            interactions
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching interactions' 
        });
    }
});

// @route   GET /api/interactions/lead/:leadId
router.get('/lead/:leadId', [
    param('leadId').isMongoId().withMessage('Invalid lead ID'),
    query('type').optional().isIn(['Email', 'Call', 'Meeting', 'Note', 'Demo', 'Task', 'Status Change', 'Proposal Sent']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const { leadId } = req.params;
        const { type, limit = 50 } = req.query;

        // Verify lead exists and belongs to user
        const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
        if (!lead) {
            return res.status(404).json({ 
                success: false,
                message: 'Lead not found' 
            });
        }

        // Build query
        const query = { 
            leadId,
            userId: req.user._id 
        };
        
        if (type) query.type = type;

        // Get interactions
        const interactions = await Interaction.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get interaction summary for this lead
        const summary = await Interaction.aggregate([
            { $match: { leadId: lead._id, userId: req.user._id } },
            { $group: {
                _id: null,
                total: { $sum: 1 },
                lastInteraction: { $max: '$createdAt' },
                emails: { $sum: { $cond: [{ $eq: ['$type', 'Email'] }, 1, 0] } },
                calls: { $sum: { $cond: [{ $eq: ['$type', 'Call'] }, 1, 0] } },
                meetings: { $sum: { $cond: [{ $eq: ['$type', 'Meeting'] }, 1, 0] } },
                positiveCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
                negativeCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } }
            }}
        ]);

        res.json({
            success: true,
            count: interactions.length,
            lead: {
                id: lead._id,
                name: lead.name,
                company: lead.company
            },
            summary: summary[0] || {
                total: 0,
                lastInteraction: null,
                emails: 0,
                calls: 0,
                meetings: 0,
                positiveCount: 0,
                negativeCount: 0
            },
            interactions
        });
    } catch (error) {
        console.error('Error fetching lead interactions:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching interactions' 
        });
    }
});

// @route   GET /api/interactions/:id
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid interaction ID')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const interaction = await Interaction.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('leadId')
            .populate('userId', 'name email');

        if (!interaction) {
            return res.status(404).json({ 
                success: false,
                message: 'Interaction not found' 
            });
        }

        res.json({
            success: true,
            interaction
        });
    } catch (error) {
        console.error('Error fetching interaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching interaction' 
        });
    }
});

// @route   POST /api/interactions
router.post('/', [
    body('leadId', 'Lead ID is required')
        .not().isEmpty()
        .isMongoId()
        .withMessage('Invalid lead ID')
        .custom(async (leadId, { req }) => {
            const lead = await Lead.findOne({  
                _id: leadId, 
                userId: req.user._id 
            });
            if (!lead) {
                throw new Error('Lead not found or not authorized');
            }
            return true;
        }),
    
    body('type', 'Interaction type is required')
        .isIn(['Email', 'Call', 'Meeting', 'Note', 'Demo', 'Task', 'Status Change', 'Proposal Sent'])
        .withMessage('Invalid interaction type'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('Notes cannot exceed 10000 characters'),
    
    body('sentiment')
        .optional()
        .isIn(['Positive', 'Neutral', 'Negative'])
        .withMessage('Invalid sentiment'),
    
    body('duration')
        .optional()
        .isInt({ min: 0, max: 1440 })
        .withMessage('Duration must be between 0 and 1440 minutes'),
    
    body('outcome')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Outcome cannot exceed 500 characters'),
    
    body('nextSteps')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Next steps cannot exceed 500 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const interactionData = {
            ...req.body,
            userId: req.user._id
        };

        const interaction = await Interaction.create(interactionData);

        // Populate lead data
        await interaction.populate('leadId', 'name company email');

        // Update lead's last interaction date
        await Lead.findOneAndUpdate({ _id: req.body.leadId, userId: req.user._id }, {
            lastInteractionAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Interaction recorded successfully',
            interaction
        });
    } catch (error) {
        console.error('Error creating interaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating interaction' 
        });
    }
});

// @route   PUT /api/interactions/:id
router.put('/:id', [
    param('id').isMongoId().withMessage('Invalid interaction ID'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('Notes cannot exceed 10000 characters'),
    
    body('sentiment')
        .optional()
        .isIn(['Positive', 'Neutral', 'Negative'])
        .withMessage('Invalid sentiment'),
    
    body('duration')
        .optional()
        .isInt({ min: 0, max: 1440 })
        .withMessage('Duration must be between 0 and 1440 minutes'),
    
    body('outcome')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Outcome cannot exceed 500 characters'),
    
    body('nextSteps')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Next steps cannot exceed 500 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        let interaction = await Interaction.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!interaction) {
            return res.status(404).json({ 
                success: false,
                message: 'Interaction not found' 
            });
        }

        // Don't allow updating leadId or type
        const { leadId, type, ...updateData } = req.body;

        interaction = await Interaction.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('leadId', 'name company');

        res.json({
            success: true,
            message: 'Interaction updated successfully',
            interaction
        });
    } catch (error) {
        console.error('Error updating interaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while updating interaction' 
        });
    }
});

// @route   DELETE /api/interactions/:id
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid interaction ID')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const interaction = await Interaction.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!interaction) {
            return res.status(404).json({ 
                success: false,
                message: 'Interaction not found' 
            });
        }

        await interaction.deleteOne();

        res.json({
            success: true,
            message: 'Interaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting interaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting interaction' 
        });
    }
});

// @route   GET /api/interactions/timeline/lead/:leadId
router.get('/timeline/lead/:leadId', [
    param('leadId').isMongoId().withMessage('Invalid lead ID')
], async (req, res) => {
    try {
        const { leadId } = req.params;

        // Verify lead exists and belongs to user
        const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
        if (!lead) {
            return res.status(404).json({ 
                success: false,
                message: 'Lead not found' 
            });
        }

        // Get all interactions and group by date
        const interactions = await Interaction.find({  
            leadId,
            userId: req.user._id 
        })
        .sort({ createdAt: -1 });

        // Group by date
        const timeline = interactions.reduce((acc, interaction) => {
            const date = interaction.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(interaction);
            return acc;
        }, {});

        res.json({
            success: true,
            lead: {
                id: lead._id,
                name: lead.name,
                company: lead.company
            },
            timeline,
            totalDays: Object.keys(timeline).length,
            totalInteractions: interactions.length
        });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching timeline' 
        });
    }
});

// @route   GET /api/interactions/stats/summary
router.get('/stats/summary', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const stats = await Interaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $facet: {
                    byType: [
                        { $group: { _id: '$type', count: { $sum: 1 } } }
                    ],
                    bySentiment: [
                        { $group: { _id: '$sentiment', count: { $sum: 1 } } }
                    ],
                    daily: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                count: { $sum: 1 },
                                types: { $addToSet: '$type' }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            period: `last ${days} days`,
            stats: stats[0] || {
                byType: [],
                bySentiment: [],
                daily: [],
                total: [{ count: 0 }]
            }
        });
    } catch (error) {
        console.error('Error fetching interaction stats:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching stats' 
        });
    }
});

export default router;