import { Response } from "express";
import { AuthRequest } from "../auth/auth.js";
export declare const registerIssuer: (creatorDID: string, creatorAccountId: string) => Promise<{
    success: boolean;
    issuer: import("mongoose").Document<unknown, {}, import("../../database/issuer.js").IIssuer, {}, {}> & import("../../database/issuer.js").IIssuer & Required<{
        _id: unknown;
    }> & {
        __v: number;
    };
    hcs: {
        transactionHash: string;
        transactionId: string;
        status: string;
        success?: undefined;
        error?: undefined;
    };
    nft: {
        success: boolean;
        TOKEN_ID: string;
        serial: number;
        status: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        TOKEN_ID?: undefined;
        serial?: undefined;
        status?: undefined;
    };
    verification: {
        success: boolean;
        record: import("mongoose").Document<unknown, {}, import("../../database/verificationSchema.js").IVerificationRecord, {}, {}> & import("../../database/verificationSchema.js").IVerificationRecord & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        transaction: {
            transactionHash: string;
            transactionId: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        record?: undefined;
        transaction?: undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: any;
    issuer?: undefined;
    hcs?: undefined;
    nft?: undefined;
    verification?: undefined;
}>;
export declare const addWorker: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getWorkers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeWorker: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const registerIssuerEcdsaAccount: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const retrieveIssuerEcdsaAccount: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBusinessesByIssuer: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBusiness: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getIssuer: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const saveTransactionId: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addCreatorType: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBusinessRumors: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getIssuers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const requestIssuerTrust: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const accessIssuerTrust: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=controller.d.ts.map