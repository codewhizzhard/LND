export function createCreator(http) {
    return {
        async registerNewCreator(publicKey, token, info) {
            try {
                const payload = { publicKey };
                if (token)
                    payload.token = token;
                if (info)
                    payload.info = info;
                const res = await http.post("/creators/add-account", payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // existing login JWT
                    },
                });
                return { success: true, data: res.data.data, token: res.data.token };
            }
            catch (err) {
                return {
                    success: false,
                    error: err.response?.data?.error || err.message,
                };
            }
        },
        async registerExistingCreator(accountId, publicKey, signature, challenge, info) {
            try {
                const payload = { accountId, publicKey, signature, challenge };
                if (info)
                    payload.info = info;
                const res = await http.post("/creators/add-existing-account", payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                return { success: true, data: res.data.data, token: res.data.token };
            }
            catch (err) {
                return {
                    success: false,
                    error: err.response?.data?.error || err.message,
                };
            }
        },
    };
}
//# sourceMappingURL=acct.js.map