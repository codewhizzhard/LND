import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

export interface MessageSDK {
  getAllMessages(): Promise<{ success: boolean; data?: any; error?: string }>;
}

export function createMessages(http: AxiosInstance): MessageSDK {
  return {
    async getAllMessages() {
      try {
        const res = await http.get("/messages/get-all-messages");
        return { success: true, data: res.data };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.error || err.message,
        };
      }
    },
  };
}
