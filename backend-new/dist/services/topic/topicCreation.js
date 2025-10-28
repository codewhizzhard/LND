export function createTopic(http) {
    return {
        async prepareNonScheduleTopicTransaction(userPublicKey, userAccountId) {
            try {
                const res = await http.post("/topic/prepare", { userPublicKey, userAccountId });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async handleNonScheduleTransaction(signedTxBytes, mintTxBytes, metadata) {
            try {
                const res = await http.post("/topic/handle", { signedTxBytes, mintTxBytes, metadata });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async handleTopicCreation(metadata) {
            try {
                const res = await http.post("/topic/create-asset", { metadata });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async getUserEvents() {
            try {
                const res = await http.get("/topic/events");
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async getUserAssets() {
            try {
                const res = await http.get("/topic/assets");
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
    };
}
//# sourceMappingURL=topicCreation.js.map