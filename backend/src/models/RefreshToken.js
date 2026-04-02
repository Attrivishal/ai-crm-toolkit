import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    token: {
        type: String,
        required: true,
        unique: true
    },

    
    expiresAt: {
        type: Date,
        required: true
        // Removed index: true to avoid duplicate
    },

    userAgent: {
        type: String,
        maxlength: 500
    },

    ipAddress: {
        type: String,
        maxlength: 45
    },

    isValid: {
        type: Boolean,
        default: true
    },

    revokedAt: Date,

    replacedBy: String
},
{
    timestamps: true
}
);

// Virtual: check if token expired
refreshTokenSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

// Virtual: check if token valid
refreshTokenSchema.virtual('isValidToken').get(function () {
    return this.isValid && !this.isExpired && !this.revokedAt;
});

// Middleware: auto invalidate expired tokens
refreshTokenSchema.pre('save', function () {
    if (this.expiresAt < new Date() && this.isValid) {
        this.isValid = false;
    }
});

// Clean expired tokens
refreshTokenSchema.statics.cleanExpired = function () {
    return this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

// TTL index - this is the only index on expiresAt needed
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
