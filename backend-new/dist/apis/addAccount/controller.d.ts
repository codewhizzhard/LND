import type { AuthRequest } from "../auth/auth.js";
import type { Response } from "express";
export declare const addNewAccountToCreator: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addExistingCreator: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=controller.d.ts.map