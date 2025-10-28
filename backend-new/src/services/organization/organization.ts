import axios from "axios";

// Define AxiosInstance type compatible with axios v1.7+
export type AxiosInstance = ReturnType<typeof axios.create>;

export interface VerificationSDK {
  getIssuer(): Promise<{ success: boolean; data?: any; error?: string }>;

  registerIssuerEcdsaAccount(
    publicKey: string,
    encryptedPrivateKey: string, salt: string, iv: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  retrieveIssuerEcdsaAccount(): Promise<{ success: boolean; data?: any; error?: string }>;
  saveTransactionId(
  transactionId: string
): Promise<{ success: boolean; data?: any; error?: string }>;

  getBusiness(role?: "worker" | "business"): Promise<{ success: boolean; data?: any; error?: string }>;

  getBusinessRumors(
  identifier: string
): Promise<{ success: boolean; data?: any;  error?: string }>;

  requestIssuerTrust(
    issuerDID: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;  


  getBusinessesByIssuer(): Promise<{ success: boolean; data?: any; error?: string }>;

  getIssuers(
  sector?: string,
  name?: string
): Promise<{ success: boolean; data?: any; error?: string }>;

  addWorker(
    orgDID: string,
    name: string, 
    accountDID: string, 
    role: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;

  getWorkers(orgDID: string): Promise<{ success: boolean; data?: any; error?: string }>;

  addCreatorType(
  sector: string,
  type: "issuer" | "business"
): Promise<{ success: boolean; data?: any; error?: string }>;

  removeWorker(
    orgDID: string,
    workerAccountDID: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  accessIssuerTrust(
  userAccountId: string
): Promise<{ success: boolean; data?: any; error?: string }>;

}

export function createVerification(http: AxiosInstance): VerificationSDK {
  return {
    async getIssuer() {
      try {
        const res = await http.get("/org/issuer");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async getIssuers(sector?: string, name?: string) {
      try {
        const params: any = {};
        if (sector) params.sector = sector;
        if (name) params.name = name;

        const res = await http.get("/org/issuers", { params });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async requestIssuerTrust(issuerDID) {
    try {
      const res = await http.post("/org/request-issuer-trust", { issuerDID });
      return { success: true, data: res.data };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  },


     async addCreatorType(sector, type) {
      try {
        const res = await http.post("/org/add-creator-type", { sector, type });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async registerIssuerEcdsaAccount(publicKey, encryptedPrivateKey, salt, iv) {
      try {
        const res = await http.post("/org/issuer/register-edsca", { publicKey, encryptedPrivateKey, salt, iv });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async retrieveIssuerEcdsaAccount() {
      try {
        const res = await http.get("/org/issuer/retrieve-edsca");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },
    async saveTransactionId(transactionId: string) {
      try {
        const res = await http.post("/org/issuer/transaction/save", { transactionId });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async getBusinessRumors(identifier: string) {
        try {
          const res = await http.post("/org/rumor/business", { identifier });
          return { success: true, data: res.data };
        } catch (err: any) {
          return { 
            success: false, 
            error: err.response?.data?.error || err.message 
          };
        }
      },

      async getBusiness(role) {
        try {
          const res = await http.get("/org/business", { params: { role } });
          return { success: true, data: res.data };
        } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async accessIssuerTrust(userAccountId) {
      try {
        const res = await http.post("/org/issuer/access-trust", { userAccountId });
        return { success: true, data: res.data };
      } catch (err: any) {
        return {
          success: false,
          error: err.response?.data?.error || err.message,
        };
      }
    },

    async getBusinessesByIssuer() {
      try {
        const res = await http.get("/org/issuer/businesses");
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async addWorker(orgDID, name, accountDID, role) {
      try {
        const res = await http.post("/org/worker/add", { orgDID, name, accountDID, role });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    async getWorkers(orgDID) {
      try {
        const res = await http.get(`/org/worker/${orgDID}`);
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },

    // ✅ DELETE using query params – no request body
    async removeWorker(orgDID, workerAccountDID) {
      try {
        const res = await http.delete("/org/worker", {
          params: { orgDID, workerAccountDID },
        });
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || err.message };
      }
    },
  };
}
