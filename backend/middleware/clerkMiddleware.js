import { clerkMiddleware, requireAuth as clerkRequireAuth } from "@clerk/express";

export { clerkMiddleware };
export const requireAuth = clerkRequireAuth();
