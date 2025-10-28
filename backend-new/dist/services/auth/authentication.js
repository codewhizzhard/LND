export function createAuth(http) {
    return {
        async signup(role, password, email, displayName, orgName, phoneHash, userType) {
            try {
                const payload = { role, password, email, userType };
                if (role === "user")
                    payload.displayName = displayName;
                if (role === "organization")
                    payload.orgName = orgName;
                if (phoneHash)
                    payload.phoneHash = phoneHash;
                const res = await http.post("/auth/signup", payload);
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async login(role, identifier, password, email) {
            try {
                const res = await http.post("/auth/login", { role, identifier, password, email });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        }
    };
}
//# sourceMappingURL=authentication.js.map