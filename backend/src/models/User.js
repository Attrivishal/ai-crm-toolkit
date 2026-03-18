import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },

    role: {
        type: String,
        enum: {
            values: ['SDR', 'AE', 'Manager', 'Admin'],
            message: '{VALUE} is not a valid role'
        },
        default: 'SDR'
    },

    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },

    // ==================== WORKSPACE FIELDS ====================
    workspaces: [{
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace'
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer']
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],

    defaultWorkspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    // ==================== END WORKSPACE FIELDS ====================

    avatar: {
        type: String,
        default: null
    },

    phone: {
        type: String,
        match: [
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            'Please provide a valid phone number'
        ],
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    },

    emailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    passwordResetToken: String,
    passwordResetExpire: Date,

    lastLogin: Date,

    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// Virtual: count user's leads
userSchema.virtual('leadsCount', {
    ref: 'Lead',
    localField: '_id',
    foreignField: 'userId',
    count: true
});

// Virtual: get user's workspaces with details
userSchema.virtual('workspaceDetails', {
    ref: 'Workspace',
    localField: 'workspaces.workspace',
    foreignField: '_id'
});

// ================= PASSWORD HASHING =================

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ================= PASSWORD COMPARISON =================

userSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// ================= WORKSPACE METHODS =================

userSchema.methods.addWorkspace = function (workspaceId, role = 'member') {
    // Check if already in workspace
    const existing = this.workspaces.find(
        w => w.workspace.toString() === workspaceId.toString()
    );
    
    if (!existing) {
        this.workspaces.push({
            workspace: workspaceId,
            role,
            joinedAt: new Date()
        });
    }
    
    // Set as default if first workspace
    if (this.workspaces.length === 1) {
        this.defaultWorkspace = workspaceId;
    }
    
    return this.save();
};

userSchema.methods.removeWorkspace = function (workspaceId) {
    this.workspaces = this.workspaces.filter(
        w => w.workspace.toString() !== workspaceId.toString()
    );
    
    // Update default workspace if needed
    if (this.defaultWorkspace?.toString() === workspaceId.toString()) {
        this.defaultWorkspace = this.workspaces[0]?.workspace || null;
    }
    
    return this.save();
};

userSchema.methods.updateWorkspaceRole = function (workspaceId, newRole) {
    const workspace = this.workspaces.find(
        w => w.workspace.toString() === workspaceId.toString()
    );
    
    if (workspace) {
        workspace.role = newRole;
    }
    
    return this.save();
};

userSchema.methods.getWorkspaceRole = function (workspaceId) {
    const workspace = this.workspaces.find(
        w => w.workspace.toString() === workspaceId.toString()
    );
    return workspace?.role || null;
};

// ================= EMAIL VERIFICATION TOKEN =================

userSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    return verificationToken;
};

// ================= PASSWORD RESET TOKEN =================

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpire = Date.now() + 60 * 60 * 1000;
    return resetToken;
};

// ================= UPDATE LAST LOGIN =================

userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

// ================= INDEXES =================

userSchema.index({ role: 1 });
userSchema.index({ company: 1 });
userSchema.index({ 'workspaces.workspace': 1 }); // For workspace lookup
userSchema.index({ defaultWorkspace: 1 }); // For default workspace

// ================= EXPORT MODEL =================

export default mongoose.model('User', userSchema);
