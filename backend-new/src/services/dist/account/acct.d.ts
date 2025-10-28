import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface CreatorSDK {
    registerNewCreator(publicKey: string, token?: string, info?: Record<string, unknown>, phoneHash?: string): Promise<{
        success: boolean;
        data?: any;
        token?: string;
        error?: string;
    }>;
    registerExistingCreator(accountId: string, publicKey: string, signature: string, challenge: string, info?: Record<string, unknown>): Promise<{
        success: boolean;
        data?: any;
        token?: string;
        error?: string;
    }>;
}
export declare function createCreator(http: AxiosInstance): CreatorSDK;
