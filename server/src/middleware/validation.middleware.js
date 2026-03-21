import { z } from 'zod';

// Validation schemas
export const schemas = {
  // Post schemas
  createPost: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    image_url: z.string().url(),
    category: z.enum(['electronics', 'documents', 'bags', 'jewelry', 'clothing', 'keys', 'phones', 'wallets', 'other']),
    location: z.string().min(1).max(255),
    date_found: z.string().datetime().optional(),
    type: z.enum(['lost', 'found']).optional(),
    contact_method: z.string().max(500).optional()
  }),

  updatePost: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    category: z.enum(['electronics', 'documents', 'bags', 'jewelry', 'clothing', 'keys', 'phones', 'wallets', 'other']).optional(),
    location: z.string().min(1).max(255).optional(),
    date_found: z.string().datetime().optional(),
    status: z.enum(['active', 'claimed', 'closed']).optional(),
    contact_method: z.string().max(500).optional()
  }),

  // Claim schema
  createClaim: z.object({
    message: z.string().min(10).max(1000),
    post_id: z.string().uuid()
  }),

  // User update schema
  updateUser: z.object({
    name: z.string().min(1).max(255).optional(),
    phone: z.string().max(50).optional(),
    avatar_url: z.string().url().optional()
  }),

  // Query params schema
  postQuery: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    category: z.string().optional(),
    location: z.string().optional(),
    search: z.string().optional(),
    type: z.enum(['lost', 'found']).optional(),
    sort: z.enum(['latest', 'oldest', 'popular']).default('latest'),
    user_id: z.string().uuid().optional()
  })
};

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const result = schema.parse(data);
      
      if (source === 'query') {
        req.validatedQuery = result;
      } else if (source === 'body') {
        req.validatedBody = result;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}
