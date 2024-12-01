const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Middleware to ensure user exists in our database
const ensureUserExists = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Get user details from Clerk
      const clerkUser = req.auth.user;
      
      // Create new user in our database
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        username: clerkUser.username || clerkUser.firstName || 'User',
      });
      
      await user.save();
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user has required permissions
const checkPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Implement your permission checking logic here
      // For now, we'll just pass through
      next();
    } catch (error) {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

// Export middleware chain
const requireAuth = [
  ClerkExpressRequireAuth(),
  ensureUserExists,
];

module.exports = {
  requireAuth,
  checkPermissions,
};
