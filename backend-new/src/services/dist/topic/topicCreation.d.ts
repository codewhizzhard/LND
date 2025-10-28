import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface TopicSDK {
    prepareNonScheduleTopicTransaction(userPublicKey: string, userAccountId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    handleNonScheduleTransaction(signedTxBytes: string, mintTxBytes?: string, metadata?: any): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    handleTopicCreation(metadata: any): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getUserEvents(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    getUserAssets(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createTopic(http: AxiosInstance): TopicSDK;
