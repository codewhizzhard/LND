import type { AuthRequest } from "./auth.ts";
import type { Response, NextFunction } from "express";
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=middleware.d.ts.map