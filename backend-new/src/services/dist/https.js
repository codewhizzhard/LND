import axios from "axios";
export function createHttpsAgent(apiKey, baseURL) {
    // Use a plain object for headers
    const headers = {};
    if (apiKey && apiKey.trim() !== "") {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const instance = axios.create({
        baseURL,
        headers,
    });
    // Add method to update token dynamically
    instance.setToken = (token) => {
        headers["Authorization"] = `Bearer ${token}`;
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };
    return instance;
}
