import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

interface AccountResponse {
  data: any;   // replace `any` with your real type
  token: string;
}

export interface CreatorSDK {
  registerNewCreator(
    publicKey: string,
    token?: string,
    info?: Record<string, unknown>,
    phoneHash?: string
  ): Promise<{ success: boolean; data?: any; token?: string; error?: string }>;

  registerExistingCreator(
    accountId: string,
    publicKey: string,
    signature: string,
    challenge: string,
    info?: Record<string, unknown>
  ): Promise<{ success: boolean; data?: any; token?: string; error?: string }>;
}

export function createCreator(http: AxiosInstance): CreatorSDK {
  return {
    async registerNewCreator(publicKey: string, token?: string, info?: Record<string, any>) {
      try {
        const payload: Record<string, any> = { publicKey };
        if (token) payload.token = token;
        if (info) payload.info = info;

        const res = await http.post<AccountResponse>("/creators/add-account", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // existing login JWT
          },
        });

        return { success: true, data: res.data.data, token: res.data.token };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.error || err.message,
        };
      }
    },

    async registerExistingCreator(accountId, publicKey, signature, challenge, info?) {
      try {
        const payload: Record<string, any> = { accountId, publicKey, signature, challenge };
        if (info) payload.info = info;

        const res = await http.post<AccountResponse>("/creators/add-existing-account", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        return { success: true, data: res.data.data, token: res.data.token };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.error || err.message,
        };
      }
    },
  };
}
