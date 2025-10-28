import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.js";
/**
 * Submit a signed Hedera transaction to the network
 */
/**
 * Receive signed transaction + optional mint transaction from frontend
 * - User signs the transaction and/or mint on the frontend
 * - Backend submits them to Hedera
 */
export declare const handleNonScheduleTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const prepareNonScheduleTopicTransaction: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleCreateAsset: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all events for the logged-in user
 */
export declare const getUserEvents: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserAssets: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=contoller.d.ts.map