import { Request, Response } from "express";
export declare const verifyEventsOnHedera: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 1. Verify from Database
 */
export declare const verifyFromDB: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 2. Verify from Hedera
 */ 
//# sourceMappingURL=controller.d.ts.map