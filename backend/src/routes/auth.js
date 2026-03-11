import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate access and refresh tokens
const generateTokens = async (userId, userAgent, ipAddress) => {
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
    );
    
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await RefreshToken.create({
        userId,
        token: refreshToken,
        expiresAt,
        userAgent: userAgent || 'unknown',
        ipAddress: ipAddress || 'unknown',
        isValid: true
    });

    return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
router.post('/register', [
    body('name', 'Name is required')
        .not().isEmpty()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('email', 'Please include a valid email')
        .isEmail()
        .normalizeEmail()
        .custom(async (email) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already registered');
            }
            return true;
        }),
    
    body('password', 'Password must be at least 6 characters')
        .isLength({ min: 6 })
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number'),
    
    body('role', 'Invalid role')
        .optional()
        .isIn(['SDR', 'AE', 'Manager']),
    
    body('company', 'Company name too long')
        .optional()
        .trim()
        .isLength({ max: 100 })
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    try {
        const { name, email, password, role, company } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'SDR',
            company: company || null
        });

        // Generate tokens
        const { accessToken, refreshToken } = await generateTokens(
            user._id, 
            req.headers['user-agent'],
            req.ip
        );

        // Update last login
        await user.updateLastLogin();

        // Return user data (excluding sensitive info)
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('🔥 Registration error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
        res.status(500).json({ 
            success: false,
            message: 'Registration failed. Please try again.' 
        });
    }
});

// @route   POST /api/auth/login
router.post('/login', [
    body('email', 'Please include a valid email')
        .isEmail()
        .normalizeEmail(),
    
    body('password', 'Password is required')
        .not().isEmpty()
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    try {
        const { email, password } = req.body;

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Your account has been deactivated. Please contact support.' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Remove old refresh tokens for this user (optional security)
        await RefreshToken.deleteMany({ 
            userId: user._id,
            isValid: true
        });

        // Generate new tokens
        const { accessToken, refreshToken } = await generateTokens(
            user._id,
            req.headers['user-agent'],
            req.ip
        );

        // Update last login
        await user.updateLastLogin();

        // Return user data
        res.json({
            success: true,
            message: 'Login successful',
            token: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Login failed. Please try again.' 
        });
    }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                success: false,
                message: 'Refresh token required' 
            });
        }

        // Find token in database
        const storedToken = await RefreshToken.findOne({ 
            token: refreshToken,
            isValid: true
        });
        
        if (!storedToken) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid refresh token' 
            });
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            await RefreshToken.findByIdAndDelete(storedToken._id);
            return res.status(403).json({ 
                success: false,
                message: 'Refresh token expired. Please login again.' 
            });
        }

        // Verify the token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Account deactivated' 
            });
        }

        // Mark old token as revoked (token rotation)
        storedToken.isValid = false;
        storedToken.revokedAt = new Date();
        await storedToken.save();

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
            decoded.id,
            req.headers['user-agent'],
            req.ip
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid refresh token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                success: false,
                message: 'Refresh token expired' 
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Token refresh failed' 
        });
    }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (refreshToken) {
            // Invalidate the refresh token
            await RefreshToken.findOneAndUpdate(
                { token: refreshToken },
                { 
                    isValid: false,
                    revokedAt: new Date()
                }
            );
        }

        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Logout failed' 
        });
    }
});

// @route   POST /api/auth/logout-all
router.post('/logout-all', protect, async (req, res) => {
    try {
        // Invalidate all refresh tokens for this user
        await RefreshToken.updateMany(
            { userId: req.user._id, isValid: true },
            { 
                isValid: false,
                revokedAt: new Date()
            }
        );

        res.json({ 
            success: true, 
            message: 'Logged out from all devices' 
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Logout failed' 
        });
    }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    try {
        // Get user with additional stats
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('leadsCount');

        // Get active sessions count
        const activeSessions = await RefreshToken.countDocuments({
            userId: req.user._id,
            isValid: true,
            expiresAt: { $gt: new Date() }
        });

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company,
                avatar: user.avatar,
                phone: user.phone,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                preferences: user.preferences,
                stats: {
                    leadsCount: user.leadsCount || 0,
                    activeSessions
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get user data' 
        });
    }
});

// @route   PUT /api/auth/me
router.put('/me', protect, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('phone')
        .optional()
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
        .withMessage('Please provide a valid phone number'),
    
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name too long'),
    
    body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object')
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
        const { name, phone, company, preferences } = req.body;
        
        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (company) updateData.company = company;
        if (preferences) updateData.preferences = preferences;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile' 
        });
    }
});

export default router;