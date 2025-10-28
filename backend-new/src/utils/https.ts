import axios from "axios";

export function createHttpsAgent(apiKey: string, baseURL: string) {
  // Use a plain object for headers
  const headers: Record<string, string> = {};
  if (apiKey && apiKey.trim() !== "") {
  headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const instance = axios.create({
    baseURL,
    headers,
  });

  // Add method to update token dynamically
  (instance as any).setToken = (token: string) => {
    headers["Authorization"] = `Bearer ${token}`;
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  return instance;
}
