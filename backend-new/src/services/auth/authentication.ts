import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

export interface AuthSDK {
  signup(
    role: "user" | "organization",
    password: string,
    email: string,
    displayName?: string,  
    orgName?: string,  
    phoneHash?: string,
    userType?: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  login(
    role: "user" | "organization",
    identifier: string,   
    password: string,
    email?: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;
}

export function createAuth(http: AxiosInstance): AuthSDK {
  return {
    async signup(role, password, email, displayName?, orgName?, phoneHash?, userType?) {
      try {
        const payload: Record<string, any> = { role, password, email, userType };
        if (role === "user") payload.displayName = displayName;
        if (role === "organization") payload.orgName = orgName;
        if (phoneHash) payload.phoneHash = phoneHash;

        const res = await http.post("/auth/signup", payload);
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async login(role, identifier, password, email?) {
      try {
        const res = await http.post("/auth/login", { role, identifier, password, email });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    }
    
  };
  
}
