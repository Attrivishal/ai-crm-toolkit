import dotenv from 'dotenv';
dotenv.config();  // It loads envirnment varables from .env 

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import morgan from 'morgan';
import hpp from 'hpp';
import passport from 'passport';

import authRoutes from './src/routes/auth.js';
import leadRoutes from './src/routes/leads.js';
import aiRoutes from './src/routes/ai.js';
import taskRoutes from './src/routes/tasks.js';
import interactionRoutes from './src/routes/interactions.js';
// import workspaceRoutes from './src/routes/workspaces.js'; // REMOVED - No longer needed
import './src/config/passport.js'; // This now has access to process.env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ==================== SECURITY MIDDLEWARES ====================

// Helmet with custom configuration
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProduction ? undefined : false,
}));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ].filter(Boolean); // Remove undefined/null

        if (isProduction) {
            // In production, strictly match CLIENT_URL, but allow local health checks
            if (origin === process.env.CLIENT_URL || !origin) {
                callback(null, true);
            } else {
                callback(new Error('CORS blocked: Origin not allowed for production'));
            }
        } else if (!origin || allowedOrigins.includes(origin) || isDevelopment) {
            // In development or local, be more flexible
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    // Removed 'x-workspace-id' from allowed headers
};

app.use(cors(corsOptions));

// ==================== BODY PARSING ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== COMPRESSION ====================

app.use(compression({
    level: 6,
    threshold: 100 * 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// ==================== SECURITY ENHANCEMENTS ====================

// Custom XSS protection middleware (replaces xss-clean)
app.use((req, res, next) => {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Basic XSS prevention - escape HTML characters
                req.body[key] = req.body[key]
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            }
        });
    }
    next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp({
    whitelist: [
        'status', 'priority', 'type', 'sortBy', 'sortOrder', 'page', 'limit'
    ]
}));

// ==================== LOGGING ====================

// Morgan logging based on environment
if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Custom request logger for important events
app.use((req, res, next) => {
    if (isDevelopment) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// ==================== RATE LIMITING ====================

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 200,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health'
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isProduction ? 10 : 20,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// AI rate limiter - FIXED keyGenerator for IPv6
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isProduction ? 50 : 100,
    message: {
        success: false,
        message: 'AI request limit reached, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

// ==================== PASSPORT INITIALIZATION ====================

// Initialize Passport for OAuth
app.use(passport.initialize());

// ==================== DATABASE CONNECTION ====================

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const mongooseOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            retryWrites: true,
            retryReads: true,
            autoIndex: isDevelopment,
        };

        const conn = await mongoose.connect(mongoUri, mongooseOptions);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        if (isDevelopment) {
            setInterval(() => {
                const pool = mongoose.connection.getClient()?.topology?.s?.pool;
                if (pool) {
                    console.log(`📊 Connection Pool - Total: ${pool.totalConnectionCount}, Available: ${pool.availableConnectionCount}`);
                }
            }, 60000);
        }

    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.warn('⚠️ Server will continue running but database features will be unavailable');

        if (isProduction) {
            console.error('❌ Exiting due to database connection failure in production');
            process.exit(1);
        }
    }
};

connectDB();

// ==================== HEALTH CHECK ENDPOINTS ====================

// Basic health check
app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    const dbStatus = isConnected ? 'connected' : 'disconnected';
    const dbHost = mongoose.connection.host || 'unknown';
    const memoryUsage = process.memoryUsage();

    res.status(isConnected ? 200 : 503).json({
        success: isConnected,
        status: isConnected ? 'ok' : 'degraded',
        message: isConnected ? 'SalesMind AI API is running' : 'Database connection unavailable',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
        },
        database: {
            status: dbStatus,
            host: dbHost,
            name: mongoose.connection.name || 'unknown',
            models: Object.keys(mongoose.models).length
        },
        services: {
            ai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
            googleOAuth: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
            githubOAuth: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not configured'
            // Removed workspace from services
        }
    });
});

// Detailed health check
app.get('/api/health/detailed', async (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
        return res.status(503).json({ success: false, message: 'Database disconnected' });
    }

    try {
        await mongoose.connection.db.admin().ping();

        const stats = await mongoose.connection.db.stats();

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            database: {
                status: 'healthy',
                collections: stats.collections,
                objects: stats.objects,
                avgObjSize: stats.avgObjSize,
                dataSize: stats.dataSize,
                indexes: stats.indexes
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Database health check failed',
            error: error.message
        });
    }
});

// ==================== WELCOME ROUTE ====================

app.get('/', (req, res) => {
    res.json({
        name: 'SalesMind AI API',
        version: '1.0.0',
        description: 'AI-Powered Sales Intelligence Platform',
        status: 'operational',
        timestamp: new Date().toISOString(),
        documentation: '/api/docs',
        health: '/api/health',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me',
                google: 'GET /api/auth/google',
                github: 'GET /api/auth/github'
            },
            leads: {
                list: 'GET /api/leads',
                create: 'POST /api/leads',
                get: 'GET /api/leads/:id',
                update: 'PUT /api/leads/:id',
                delete: 'DELETE /api/leads/:id',
                status: 'PATCH /api/leads/:id/status'
            },
            ai: {
                analyzeLead: 'POST /api/ai/analyze-lead',
                generateEmail: 'POST /api/ai/generate-email',
                summarizeMeeting: 'POST /api/ai/summarize-meeting',
                dealRisk: 'POST /api/ai/deal-risk',
                generateProposal: 'POST /api/ai/generate-proposal'
            },
            tasks: {
                list: 'GET /api/tasks',
                create: 'POST /api/tasks',
                update: 'PUT /api/tasks/:id',
                delete: 'DELETE /api/tasks/:id',
                status: 'PATCH /api/tasks/:id/status',
                overdue: 'GET /api/tasks/overdue',
                today: 'GET /api/tasks/today',
                upcoming: 'GET /api/tasks/upcoming'
            },
            interactions: {
                list: 'GET /api/interactions',
                create: 'POST /api/interactions',
                get: 'GET /api/interactions/:id',
                update: 'PUT /api/interactions/:id',
                delete: 'DELETE /api/interactions/:id',
                lead: 'GET /api/interactions/lead/:leadId',
                timeline: 'GET /api/interactions/timeline/lead/:leadId',
                stats: 'GET /api/interactions/stats/summary'
            }
        }
    });
});

// ==================== ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/interactions', interactionRoutes);
// app.use('/api/workspaces', workspaceRoutes); // REMOVED - Workspace routes no longer exist

// ==================== 404 HANDLER ====================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.url}`,
        availableEndpoints: '/'
    });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'APIError';
    }
}

// Main error handler
app.use((err, req, res, next) => {
    // Log error
    console.error('❌ Error:', {
        message: err.message,
        stack: isDevelopment ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            field: field
        });
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Custom API error
    if (err.name === 'APIError') {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: isProduction ? 'Internal Server Error' : err.message,
        ...(isDevelopment && { stack: err.stack })
    });
});

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    const forceShutdown = setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    try {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        clearTimeout(forceShutdown);
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        clearTimeout(forceShutdown);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('Uncaught Exception');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    gracefulShutdown('Unhandled Rejection');
});

// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
    console.log(`\n🚀 ==================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚀 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🚀 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🚀 OAuth: Google ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'} | GitHub ${process.env.GITHUB_CLIENT_ID ? '✅' : '❌'}`);
    console.log(`🚀 ==================================\n`);
});

export { app, server };