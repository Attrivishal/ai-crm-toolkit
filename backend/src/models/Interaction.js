import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
    leadId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lead', 
        required: [true, 'Lead ID is required'],
        index: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User ID is required'],
        index: true
    },
    type: { 
        type: String, 
        enum: {
            values: ['Email', 'Call', 'Meeting', 'Note', 'Demo', 'Task', 'Status Change', 'Proposal Sent'],
            message: '{VALUE} is not a valid interaction type'
        },
        required: [true, 'Interaction type is required'],
        index: true
    },
    title: {
        type: String,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    notes: { 
        type: String,
        maxlength: [10000, 'Notes cannot exceed 10000 characters']
    },
    aiSummary: { 
        type: String,
        maxlength: [2000, 'AI summary cannot exceed 2000 characters']
    },
    sentiment: { 
        type: String, 
        enum: {
            values: ['Positive', 'Neutral', 'Negative'],
            message: '{VALUE} is not a valid sentiment'
        },
        default: 'Neutral'
    },
    duration: {
        type: Number, // in minutes
        min: [0, 'Duration cannot be negative']
    },
    outcome: {
        type: String,
        maxlength: [500, 'Outcome cannot exceed 500 characters']
    },
    nextSteps: {
        type: String,
        maxlength: [500, 'Next steps cannot exceed 500 characters']
    },
    attachments: [{
        filename: String,
        url: String,
        size: Number,
        uploadedAt: Date
    }],
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

// Virtual for formatted duration
interactionSchema.virtual('formattedDuration').get(function() {
    if (!this.duration) return 'N/A';
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Indexes
interactionSchema.index({ leadId: 1, createdAt: -1 });
interactionSchema.index({ userId: 1, createdAt: -1 });
interactionSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Interaction', interactionSchema);