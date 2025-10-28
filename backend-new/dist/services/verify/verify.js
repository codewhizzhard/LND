export function createVerify(http) {
    return {
        // ✅ Verify events from DB
        async verifyEventsFromDB(topicId) {
            try {
                const res = await http.get(`/verify/db/${topicId}`);
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        // ✅ Verify events on Hedera
        async verifyEventsOnHedera(events) {
            try {
                const res = await http.post(`/verify/hedera`, { events });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
    };
}
//# sourceMappingURL=verify.js.map