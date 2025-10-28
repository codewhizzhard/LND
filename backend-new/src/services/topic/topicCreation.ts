import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

export interface TopicSDK {
  prepareNonScheduleTopicTransaction(
    userPublicKey: string,
    userAccountId: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  handleNonScheduleTransaction(
    signedTxBytes: string,
    mintTxBytes?: string,
    metadata?: any
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  handleTopicCreation(
    metadata: any
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  getUserEvents(): Promise<{ success: boolean; data?: any; error?: string }>;

  getUserAssets(): Promise<{ success: boolean; data?: any; error?: string }>;
}

export function createTopic(http: AxiosInstance): TopicSDK {
  return {
    async prepareNonScheduleTopicTransaction(userPublicKey, userAccountId) {
      try {
        const res = await http.post("/topic/prepare", { userPublicKey, userAccountId });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async handleNonScheduleTransaction(signedTxBytes, mintTxBytes, metadata) {
      try {
        const res = await http.post("/topic/handle", { signedTxBytes, mintTxBytes, metadata });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async handleTopicCreation(metadata) {
      try {
        const res = await http.post("/topic/create-asset", { metadata });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async getUserEvents() {
      try {
        const res = await http.get("/topic/events");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async getUserAssets() {
      try {
        const res = await http.get("/topic/assets");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },
  };
}
