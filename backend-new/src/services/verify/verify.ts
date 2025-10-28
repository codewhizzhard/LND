import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;


export interface VerifySDK {
    verifyEventsFromDB(topicId: string): Promise<{ success: boolean; data?: any; error?: string }>;
    
    verifyEventsOnHedera(events: any[]): Promise<{ success: boolean; data?: any; error?: string }>;

}

export function createVerify(http: AxiosInstance): VerifySDK {
    return {
             // ✅ Verify events from DB
        async verifyEventsFromDB(topicId: string) {
        try {
            const res = await http.get(`/verify/db/${topicId}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.error || err.message };
        }
        },

        // ✅ Verify events on Hedera
        async verifyEventsOnHedera(events: any[]) {
        try {
            const res = await http.post(`/verify/hedera`, { events });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.error || err.message };
        }
        },
    }
}