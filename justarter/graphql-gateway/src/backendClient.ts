import axios, { type AxiosInstance } from "axios";
import type { Suggestion } from "./domain/suggestion.js";

const DEFAULT_BACKEND_TIMEOUT_MS = 2_000;

interface Logger {
  error(message: string): void;
}

export interface BackendAPI {
  getSuggestions(query: string, limit: number): Promise<Suggestion[]>;
  getSuggestionById(id: number): Promise<Suggestion | null>;
  createSuggestion(term: string): Promise<Suggestion | null>;
}

export class HttpBackendClient implements BackendAPI {
  constructor(
    private readonly client: Pick<AxiosInstance, "get" | "post">,
    private readonly logger: Logger = console,
  ) {}

  async getSuggestions(query: string, limit: number): Promise<Suggestion[]> {
    try {
      const response = await this.client.get<Suggestion[]>("/suggestions", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch suggestions from backend: ${formatError(error)}`,
      );
      return [];
    }
  }

  async getSuggestionById(id: number): Promise<Suggestion | null> {
    try {
      const response = await this.client.get<Suggestion>(`/suggestions/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch suggestion from backend: ${formatError(error)}`,
      );
      return null;
    }
  }

  async createSuggestion(term: string): Promise<Suggestion | null> {
    try {
      const response = await this.client.post<Suggestion>("/suggestions", {
        term,
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create suggestion in backend: ${formatError(error)}`,
      );
      return null;
    }
  }
}

function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return `${error.code ?? "HTTP_ERROR"}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export function parseBackendTimeout(value: string | undefined): number {
  const timeout = Number(value ?? DEFAULT_BACKEND_TIMEOUT_MS);

  if (!Number.isInteger(timeout) || timeout < 1) {
    return DEFAULT_BACKEND_TIMEOUT_MS;
  }

  return timeout;
}

const client = axios.create({
  baseURL: process.env.BACKEND_URL ?? "http://localhost:3001",
  timeout: parseBackendTimeout(process.env.BACKEND_TIMEOUT_MS),
});

export const backendAPI = new HttpBackendClient(client);
