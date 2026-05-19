import { api } from "./api";

export type ChatMessage = {
  id: number;
  text: string;
  sender_id: number | null;
  is_read: boolean;
  created_at: string;
};

export type PaginatedMessages = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
};

export async function getMessages(limit = 50, offset = 0): Promise<PaginatedMessages> {
  const response = await api.get<PaginatedMessages>("/chat/messages/", {
    params: { limit, offset },
    requireAuth: true,
  });
  return response.data;
}

export function getWsUrl(token: string): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
  const host = baseUrl.replace(/^https?:\/\//i, "").replace(/\/api\/?$/i, "");
  return `${wsProtocol}://${host}/ws/chat/?token=${token}`;
}
