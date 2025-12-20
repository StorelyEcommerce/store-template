import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from '../types';
import { jwtVerify } from 'jose';

interface PlatformJWTPayload {
    sub: string;        // User ID
    email: string;      // User email
    type: 'access';     // Token type
    exp: number;        // Expiration timestamp
    iat: number;        // Issued at timestamp
    sessionId: string;  // Session ID
}

/**
 * Admin authentication middleware
 * Supports two authentication methods:
 * 1. Legacy: Bearer token with ADMIN_API_KEY (for backward compatibility)
 * 2. Platform JWT: Bearer token with platform-issued JWT (for centralized admin dashboard)
 */
export async function adminAuth(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HTTPException(401, { message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const apiKey = c.env.ADMIN_API_KEY;
    const platformJwtSecret = c.env.PLATFORM_JWT_SECRET;

    // Method 1: Check if it's the admin API key (legacy/simple auth)
    if (token === apiKey) {
        await next();
        return;
    }

    // Method 2: Try to validate as platform JWT (centralized admin dashboard)
    if (platformJwtSecret) {
        try {
            const jwtSecret = new TextEncoder().encode(platformJwtSecret);
            const { payload } = await jwtVerify(token, jwtSecret);

            // Validate required JWT fields
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                throw new HTTPException(401, { message: 'Token expired' });
            }

            if (!payload.sub || !payload.email || payload.type !== 'access') {
                throw new HTTPException(401, { message: 'Invalid token payload' });
            }

            // Attach user info to context for downstream use
            const jwtPayload = payload as unknown as PlatformJWTPayload;
            c.set('userId', jwtPayload.sub);
            c.set('userEmail', jwtPayload.email);

            await next();
            return;
        } catch (error) {
            // If JWT validation fails, continue to throw unauthorized
            if (error instanceof HTTPException) {
                throw error;
            }
            // JWT verification failed - will fall through to unauthorized
        }
    }

    throw new HTTPException(401, { message: 'Unauthorized' });
}
