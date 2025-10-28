import axios from "axios";
export type AxiosInstance = ReturnType<typeof axios.create>;
export interface ContactSDK {
    addContact(contactAccountId: string, displayName: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    viewAllContacts(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare function createContact(http: AxiosInstance): ContactSDK;
