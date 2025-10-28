import type { Request, Response } from "express";
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
interface TokenRecord {
    phone: string;
    exp: number;
    type: "registration" | "transaction";
    data?: any;
}
export declare const createWhatsappToken: (from: string, type: "registration" | "transaction", data?: any) => string;
export declare const verifyToken: (token: string) => TokenRecord | null;
export declare const verifyWhatsappToken: (req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const whatsappWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=control.d.ts.map