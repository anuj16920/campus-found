// Auth middleware - currently passes through (no auth required)
// Supabase storage is handled server-side via service key

export const authenticate = (req, res, next) => next();

export const optionalAuth = (req, res, next) => {
  req.user = null;
  next();
};

export default { authenticate, optionalAuth };
