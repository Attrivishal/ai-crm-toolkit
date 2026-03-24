import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'completed', 'cancelled', 'overdue'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        index: true
    },
    priority: {
        type: String,
        enum: {
            values: ['Low', 'Medium', 'High', 'Urgent'],
            message: '{VALUE} is not a valid priority'
        },
        default: 'Medium',
        index: true
    },
    source: {
        type: String,
        enum: {
            values: ['AI-Generated', 'Manual', 'System'],
            message: '{VALUE} is not a valid source'
        },
        default: 'Manual'
    },
    category: {
        type: String,
        enum: ['Follow-up', 'Call', 'Email', 'Meeting', 'Research', 'Proposal', 'Other'],
        default: 'Other'
    },
    completedAt: {
        type: Date
    },
    reminder: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
    return this.status !== 'completed' && this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
    const diff = this.dueDate - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
    // Auto-update status based on due date
    if (this.status !== 'completed' && this.dueDate < new Date()) {
        this.status = 'overdue';
    }

    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }

    next();
});

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: -1 });
taskSchema.index({ leadId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 }); // For overdue queries

export default mongoose.model('Task', taskSchema);