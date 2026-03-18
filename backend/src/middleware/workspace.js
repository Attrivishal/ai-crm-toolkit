import Workspace from '../models/Workspace.js';

export const validateWorkspaceAccess = async (req, res, next) => {
    try {
        console.log('🏢 validateWorkspaceAccess - START');
        console.log('🏢 validateWorkspaceAccess - req exists:', !!req);
        
        if (req) {
            console.log('🏢 validateWorkspaceAccess - headers:', req.headers ? 'present' : 'missing');
            console.log('🏢 validateWorkspaceAccess - user exists:', !!req.user);
        }

        // CRITICAL: Check if req exists
        if (!req) {
            console.error('❌ validateWorkspaceAccess: req is undefined');
            return next();
        }

        // Get workspace ID from header, query, or body with safe navigation
        const workspaceId = req.headers?.['x-workspace-id'] ||
                           req.query?.workspaceId ||
                           req.body?.workspaceId;

        console.log('🏢 validateWorkspaceAccess - workspaceId:', workspaceId);

        // Skip workspace validation for routes that don't need it
        if (!workspaceId) {
            console.log('🏢 validateWorkspaceAccess - no workspaceId, skipping');
            return next();
        }

        // Check if user exists (should be set by protect middleware)
        if (!req.user) {
            console.error('❌ validateWorkspaceAccess: req.user is undefined');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('🏢 validateWorkspaceAccess - user ID:', req.user._id);

        // Check if user has access to this workspace
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        });

        console.log('🏢 validateWorkspaceAccess - workspace found:', !!workspace);

        if (!workspace) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this workspace'
            });
        }

        // Attach workspace to request for later use
        req.workspace = workspace;
        req.workspaceId = workspaceId;

        console.log('🏢 validateWorkspaceAccess - SUCCESS, proceeding');
        next();
    } catch (error) {
        console.error('❌ Workspace middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating workspace access'
        });
    }
};

export const requireWorkspaceRole = (roles) => {
    return async (req, res, next) => {
        try {
            console.log('👑 requireWorkspaceRole - checking roles:', roles);
            
            if (!req?.workspace) {
                console.error('👑 requireWorkspaceRole - workspace context not found');
                return res.status(400).json({
                    success: false,
                    message: 'Workspace context not found'
                });
            }

            if (!req?.user) {
                console.error('👑 requireWorkspaceRole - user not found');
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const workspace = req.workspace;

            // Check if user is owner
            if (workspace.owner.toString() === req.user._id.toString()) {
                console.log('👑 requireWorkspaceRole - user is owner, authorized');
                return next();
            }

            const member = workspace.members.find(
                m => m.user.toString() === req.user._id.toString()
            );

            if (!member || !roles.includes(member.role)) {
                console.log('👑 requireWorkspaceRole - user not authorized');
                return res.status(403).json({
                    success: false,
                    message: `You need ${roles.join(' or ')} role to perform this action`
                });
            }

            console.log('👑 requireWorkspaceRole - user authorized with role:', member.role);
            next();
        } catch (error) {
            console.error('❌ Role middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking workspace role'
            });
        }
    };
};
