import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface AuthSDK {
    signup(role: "user" | "organization", password: string, email: string, displayName?: string, orgName?: string, phoneHash?: string, userType?: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    login(role: "user" | "organization", identifier: string, password: string, email?: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createAuth(http: AxiosInstance): AuthSDK;
//# sourceMappingURL=authentication.d.ts.map