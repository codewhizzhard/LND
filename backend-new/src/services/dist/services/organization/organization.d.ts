import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface VerificationSDK {
    getIssuer(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    registerIssuerEcdsaAccount(publicKey: string, encryptedPrivateKey: string, salt: string, iv: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    retrieveIssuerEcdsaAccount(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    saveTransactionId(transactionId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getBusiness(role?: "worker" | "business"): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getBusinessRumors(identifier: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    requestIssuerTrust(issuerDID: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getBusinessesByIssuer(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getIssuers(sector?: string, name?: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    addWorker(orgDID: string, name: string, accountDID: string, role: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getWorkers(orgDID: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    addCreatorType(sector: string, type: "issuer" | "business"): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    removeWorker(orgDID: string, workerAccountDID: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    accessIssuerTrust(userAccountId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createVerification(http: AxiosInstance): VerificationSDK;
