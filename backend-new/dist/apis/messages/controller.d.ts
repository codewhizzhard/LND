import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.js";
/**
 * Get all messages for the logged-in creator
 */
export declare const getAllMessages: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=controller.d.ts.map