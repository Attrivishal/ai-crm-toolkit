import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    console.log("🔒 protect middleware - START");
    try {
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies (if using cookies)
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized to access this route. Please login.' 
            });
        }

        // Verify token
    console.log("🔒 protect middleware - token verified");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
    console.log("🔒 protect middleware - fetching user");
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found. Please login again.' 
            });
        }

        // Check if user is active (you can add an isActive field to User model)
        if (user.isActive === false) {
            return res.status(401).json({ 
                success: false,
                message: 'Your account has been deactivated. Please contact support.' 
            });
        }

        // Attach user to request
        req.user = user;
    console.log("🔒 protect middleware - user attached:", user?._id);
        next();

    } catch (error) {
    console.error("🔒 protect middleware - ERROR:", error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token. Please login again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Authentication error. Please try again.' 
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`,
                requiredRoles: roles
            });
        }
        next();
    };
};

// Optional: Middleware to check if user owns the resource
export const checkOwnership = (model) => async (req, res, next) => {
    console.log("🔒 protect middleware - START");
    try {
        const resourceId = req.params.id;
        const userId = req.user._id;

        const resource = await model.findById(resourceId);
        
        if (!resource) {
            return res.status(404).json({ 
                success: false,
                message: 'Resource not found' 
            });
        }

        if (resource.userId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'You do not have permission to access this resource' 
            });
        }

        req.resource = resource;
        next();
    } catch (error) {
    console.error("🔒 protect middleware - ERROR:", error.message);
        next(error);
    }
};