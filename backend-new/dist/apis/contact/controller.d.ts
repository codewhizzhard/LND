import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.js";
/**
 * Add a contact for the current user
 */ export declare const addContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * View all contacts for the current user
 */
export declare const viewAllContacts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=controller.d.ts.map