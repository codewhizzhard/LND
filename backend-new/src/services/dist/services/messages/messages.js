export function createMessages(http) {
    return {
        async getAllMessages() {
            try {
                const res = await http.get("/messages/get-all-messages");
                return { success: true, data: res.data };
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
