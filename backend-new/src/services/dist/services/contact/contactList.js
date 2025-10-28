export function createContact(http) {
    return {
        async addContact(contactAccountId, displayName) {
            try {
                const res = await http.post("/contacts/add-contact", { contactAccountId, displayName });
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        },
        async viewAllContacts() {
            try {
                const res = await http.get("/contacts/get-all-contacts");
                return { success: true, data: res.data };
            }
            catch (err) {
                return { success: false, error: err.response?.data?.error || err.message };
            }
        }
    };
}
