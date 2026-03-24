import express from 'express';
import { body, validationResult, param } from 'express-validator';
import Task from '../models/Task.js';
import Lead from '../models/Lead.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @route   GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const {
            status,
            priority,
            category,
            leadId,
            limit = 50,
            page = 1,
            sortBy = 'dueDate',
            sortOrder = 'asc'
        } = req.query;

        // Build query
        const query = { 
            userId: req.user._id 
        };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (leadId) query.leadId = leadId;

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const tasks = await Task.find(query)
            .populate('leadId', 'name company')
            .populate('assignedTo', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        // Get total count
        const total = await Task.countDocuments(query);

        // Get counts by status
        const statusCounts = await Task.aggregate([
            { $match: { 
                userId: req.user._id 
            }},
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get overdue tasks count
        const overdueCount = await Task.countDocuments({
            userId: req.user._id,
            status: { $nin: ['completed', 'cancelled'] },
            dueDate: { $lt: new Date() }
        });

        res.json({
            success: true,
            count: tasks.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            stats: {
                byStatus: statusCounts,
                overdue: overdueCount
            },
            tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks'
        });
    }
});

// @route   GET /api/tasks/overdue
router.get('/overdue', async (req, res) => {
    try {
        const tasks = await Task.find({
            userId: req.user._id,
            status: { $nin: ['completed', 'cancelled'] },
            dueDate: { $lt: new Date() }
        })
        .populate('leadId', 'name company')
        .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching overdue tasks'
        });
    }
});

// @route   GET /api/tasks/today
router.get('/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            userId: req.user._id,
            status: { $nin: ['completed', 'cancelled'] },
            dueDate: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate('leadId', 'name company')
        .sort({ priority: -1, dueDate: 1 });

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error('Error fetching today\'s tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching today\'s tasks'
        });
    }
});

// @route   GET /api/tasks/upcoming
router.get('/upcoming', async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(days));
        endDate.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            userId: req.user._id,
            status: { $nin: ['completed', 'cancelled'] },
            dueDate: { $gte: startDate, $lte: endDate }
        })
        .populate('leadId', 'name company')
        .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: tasks.length,
            timeframe: `next ${days} days`,
            tasks
        });
    } catch (error) {
        console.error('Error fetching upcoming tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching upcoming tasks'
        });
    }
});

// @route   GET /api/tasks/:id
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid task ID')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        })
            .populate('leadId')
            .populate('assignedTo', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task'
        });
    }
});

// @route   POST /api/tasks
router.post('/', [
    body('title', 'Title is required')
        .not().isEmpty()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('dueDate', 'Due date is required')
        .not().isEmpty()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom(value => {
            if (new Date(value) < new Date()) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Urgent'])
        .withMessage('Invalid priority'),

    body('category')
        .optional()
        .isIn(['Follow-up', 'Call', 'Email', 'Meeting', 'Research', 'Proposal', 'Other'])
        .withMessage('Invalid category'),

    body('leadId')
        .optional()
        .isMongoId()
        .withMessage('Invalid lead ID')
        .custom(async (leadId, { req }) => {
            if (leadId) {
                const lead = await Lead.findOne({
                    _id: leadId,
                    userId: req.user._id
                });
                if (!lead) {
                    throw new Error('Lead not found or not authorized');
                }
            }
            return true;
        }),

    body('reminder')
        .optional()
        .isISO8601()
        .withMessage('Invalid reminder date')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const taskData = {
            ...req.body,
            userId: req.user._id,
            source: 'Manual'
        };

        const task = await Task.create(taskData);

        // Populate lead data if exists
        if (task.leadId) {
            await task.populate('leadId', 'name company');
        }

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating task'
        });
    }
});

// @route   PUT /api/tasks/:id
router.put('/:id', [
    param('id').isMongoId().withMessage('Invalid task ID'),

    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Urgent'])
        .withMessage('Invalid priority'),

    body('category')
        .optional()
        .isIn(['Follow-up', 'Call', 'Email', 'Meeting', 'Research', 'Proposal', 'Other'])
        .withMessage('Invalid category'),

    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        let task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // If status is being updated to completed, set completedAt
        if (req.body.status === 'completed' && task.status !== 'completed') {
            req.body.completedAt = new Date();
        }

        // Update task
        task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('leadId', 'name company');

        res.json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating task'
        });
    }
});

// @route   PATCH /api/tasks/:id/status
router.patch('/:id/status', [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('status', 'Status is required')
        .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { status } = req.body;

        let task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Prepare update data
        const updateData = { status };

        // Set completedAt if status is completed
        if (status === 'completed' && task.status !== 'completed') {
            updateData.completedAt = new Date();
        }

        // Clear completedAt if status is not completed
        if (status !== 'completed') {
            updateData.completedAt = null;
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            message: `Task marked as ${status}`,
            task
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating task status'
        });
    }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid task ID')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.deleteOne();

        res.json({
            success: true,
            message: 'Task removed successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting task'
        });
    }
});

// @route   POST /api/tasks/:id/duplicate
router.post('/:id/duplicate', [
    param('id').isMongoId().withMessage('Invalid task ID')
], async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Create duplicate task
        const taskData = task.toObject();
        delete taskData._id;
        delete taskData.createdAt;
        delete taskData.updatedAt;
        delete taskData.completedAt;

        taskData.title = `${taskData.title} (Copy)`;
        taskData.status = 'pending';
        taskData.source = 'Manual';

        const newTask = await Task.create(taskData);

        res.status(201).json({
            success: true,
            message: 'Task duplicated successfully',
            task: newTask
        });
    } catch (error) {
        console.error('Error duplicating task:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while duplicating task'
        });
    }
});

// @route   DELETE /api/tasks/completed
router.delete('/completed/clear', async (req, res) => {
    try {
        const result = await Task.deleteMany({
            userId: req.user._id,
            status: 'completed'
        });

        res.json({
            success: true,
            message: `Cleared ${result.deletedCount} completed tasks`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing completed tasks'
        });
    }
});

export default router;