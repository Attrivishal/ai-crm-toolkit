import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Lead name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ],
        index: true
    },
    phone: {
        type: String,
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please provide a valid phone number'],
        default: null
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['New Lead', 'Contacted', 'Qualified', 'Demo Scheduled', 'Proposal Sent', 'Closed Won', 'Closed Lost'],
            message: '{VALUE} is not a valid status'
        },
        default: 'New Lead',
        index: true
    },
    leadScore: {
        type: Number,
        min: [0, 'Lead score cannot be less than 0'],
        max: [100, 'Lead score cannot exceed 100'],
        default: 0
    },
    value: {
        type: Number,
        min: [0, 'Deal value cannot be negative'],
        default: 0
    },
    notes: {
        type: String,
        maxlength: [5000, 'Notes cannot exceed 5000 characters'],
        default: ''
    },
    source: {
        type: String,
        enum: ['Website', 'Referral', 'LinkedIn', 'Email Campaign', 'Event', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    expectedCloseDate: {
        type: Date
    },
    aiAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    tags: [{
        type: String,
        trim: true
    }],
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for interactions
leadSchema.virtual('interactions', {
    ref: 'Interaction',
    localField: '_id',
    foreignField: 'leadId'
});

// Virtual for tasks
leadSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'leadId'
});

// Virtual for days in current stage
leadSchema.virtual('daysInStage').get(function() {
    return Math.floor((Date.now() - this.updatedAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
leadSchema.pre('save', function () {
    // Auto-calculate priority based on lead score and value
    if (this.leadScore >= 80 && this.value >= 50000) {
        this.priority = 'Critical';
    } else if (this.leadScore >= 60 || this.value >= 25000) {
        this.priority = 'High';
    } else if (this.leadScore >= 40 || this.value >= 10000) {
        this.priority = 'Medium';
    } else {
        this.priority = 'Low';
    }
});

// Indexes for better query performance
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, leadScore: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ company: 'text', name: 'text' }); // For text search


export default mongoose.model('Lead', leadSchema);