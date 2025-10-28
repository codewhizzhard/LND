import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface MessageSDK {
    getAllMessages(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createMessages(http: AxiosInstance): MessageSDK;
