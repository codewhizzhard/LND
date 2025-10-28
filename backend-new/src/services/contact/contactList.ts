import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

export interface ContactSDK {
  addContact(contactAccountId: string, displayName: string): Promise<{ success: boolean; data?: any; error?: string }>;
  viewAllContacts(): Promise<{ success: boolean; data?: any; error?: string }>;
}

export function createContact(http: AxiosInstance): ContactSDK {
  return {
    async addContact(contactAccountId, displayName) {
      try {
        const res = await http.post("/contacts/add-contact", { contactAccountId, displayName });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async viewAllContacts() {
      try {
        const res = await http.get("/contacts/get-all-contacts");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    }
  };
}
