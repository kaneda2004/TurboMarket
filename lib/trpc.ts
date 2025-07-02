import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Context creation
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;
  
  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerSession(req, res, {
    // Your NextAuth.js options
  });

  return {
    req,
    res,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Reusable middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Protected procedure
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Rate limiting middleware
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  // Implement rate limiting logic here
  // You can use Redis or in-memory storage for rate limiting
  
  const identifier = ctx.session?.user?.id || ctx.req.ip || 'anonymous';
  const key = `rate_limit:${path}:${identifier}`;
  
  // Simple in-memory rate limiting (in production, use Redis)
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      });
    }
  }
  
  return next();
});

export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware);
export const rateLimitedProtectedProcedure = protectedProcedure.use(rateLimitMiddleware);

// Admin middleware
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  // Check if user is admin (you'll need to implement this logic)
  const isAdmin = ctx.session.user.email?.endsWith('@admin.com'); // Example check
  
  if (!isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

// Logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  
  const result = await next();
  
  const durationMs = Date.now() - start;
  
  const logLevel = result.ok ? 'info' : 'error';
  const message = `${type} ${path} - ${durationMs}ms`;
  
  if (logLevel === 'error') {
    console.error(message, result.error);
  } else {
    console.log(message);
  }
  
  return result;
});

export const loggedProcedure = publicProcedure.use(loggingMiddleware);

// Input validation helpers
export const createInputSchema = <T extends z.ZodRawShape>(shape: T) => {
  return z.object(shape);
};

// Pagination schema
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  cursor: z.string().optional(),
});

// Common response schemas
export const successSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export const errorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

// Utility function for paginated responses
export const createPaginatedResponse = <T>(
  items: T[],
  total: number,
  limit: number,
  offset: number
) => {
  return {
    items,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Example router structure
export const exampleRouter = createTRPCRouter({
  // Public procedures
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Protected procedures
  getProfile: protectedProcedure
    .query(({ ctx }) => {
      return {
        user: ctx.session.user,
      };
    }),

  // Rate limited procedures
  sendMessage: rateLimitedProtectedProcedure
    .input(z.object({
      content: z.string().min(1).max(1000),
      recipientId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Send message logic here
      return {
        success: true,
        messageId: 'generated-id',
      };
    }),

  // Admin procedures
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      // Delete user logic here
      return { success: true };
    }),

  // Paginated procedures
  getUsers: protectedProcedure
    .input(paginationSchema.extend({
      search: z.string().optional(),
      role: z.enum(['admin', 'user']).optional(),
    }))
    .query(async ({ input }) => {
      // Fetch users with pagination
      const users = []; // Your data fetching logic
      const total = 0; // Total count
      
      return createPaginatedResponse(users, total, input.limit, input.offset);
    }),

  // Subscription example (for real-time features)
  onUserUpdate: protectedProcedure
    .subscription(({ ctx }) => {
      // Return an observable for real-time updates
      // This requires additional setup with WebSockets or SSE
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Subscriptions require additional setup',
      });
    }),
});

// Main app router
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  // Add other routers here
  // auth: authRouter,
  // posts: postsRouter,
  // comments: commentsRouter,
});

export type AppRouter = typeof appRouter;

// Client-side helpers for Next.js
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

// Server-side caller
export const createCaller = (ctx: Context) => {
  return appRouter.createCaller(ctx);
};

// Error handling utilities
export const handleTRPCError = (error: unknown) => {
  if (error instanceof TRPCError) {
    return {
      message: error.message,
      code: error.code,
      data: error.data,
    };
  }
  
  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      code: 'BAD_REQUEST',
      data: error.flatten(),
    };
  }
  
  return {
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    data: null,
  };
};

// Middleware for handling async operations
export const createAsyncMiddleware = <T>(
  asyncFn: (ctx: Context) => Promise<T>
) => {
  return t.middleware(async ({ ctx, next }) => {
    try {
      const result = await asyncFn(ctx);
      return next({
        ctx: {
          ...ctx,
          asyncResult: result,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Async operation failed',
        cause: error,
      });
    }
  });
};

// Database transaction middleware (if using Prisma)
export const transactionMiddleware = t.middleware(async ({ ctx, next }) => {
  // If you're using Prisma, you can implement transaction middleware here
  return next();
});

// Cache middleware
export const cacheMiddleware = (ttl: number = 60) => {
  const cache = new Map<string, { data: any; expiry: number }>();
  
  return t.middleware(async ({ path, input, next }) => {
    const key = `${path}:${JSON.stringify(input)}`;
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expiry) {
      return { ok: true, data: cached.data };
    }
    
    const result = await next();
    
    if (result.ok) {
      cache.set(key, {
        data: result.data,
        expiry: Date.now() + ttl * 1000,
      });
    }
    
    return result;
  });
};

export const cachedProcedure = publicProcedure.use(cacheMiddleware(300)); // 5 minutes cache