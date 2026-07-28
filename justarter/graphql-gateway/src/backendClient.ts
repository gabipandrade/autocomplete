import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

const client = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
});

interface Suggestion {
  id: number;
  term: string;
  count: number;
  createdAt: string;
}

export const backendAPI = {
  async getSuggestions(q: string): Promise<Suggestion[]> {
    try {
      const response = await client.get<Suggestion[]>("/api/suggestions", {
        params: { q },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  },

  async getSuggestionById(id: number): Promise<Suggestion | null> {
    try {
      const response = await client.get<Suggestion>(
        `/api/suggestions/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      return null;
    }
  },

  async createSuggestion(term: string): Promise<Suggestion | null> {
    try {
      const response = await client.post<Suggestion>("/api/suggestions", {
        term,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating suggestion:", error);
      return null;
    }
  },
};
