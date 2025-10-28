import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface VerifySDK {
    verifyEventsFromDB(topicId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    verifyEventsOnHedera(events: any[]): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createVerify(http: AxiosInstance): VerifySDK;
