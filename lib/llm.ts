import { api, type ApiError } from "./api";
import EventSource from "react-native-sse";
import { getTokens } from "./storage";

export type LlmChatRequest = {
    message: string;
    conversation_id?: number | null;
};

export type LlmChatResponse = {
    response: string;
    conversation_id: number;
};

export type Conversation = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
};

export type Message = {
    id: number;
    role: "user" | "ai";
    text: string;
    created_at: string;
};

export async function llmChat(
    message: string,
    conversationId?: number | null,
    signal?: AbortSignal
): Promise<LlmChatResponse> {
    const trimmed = message.trim();
    if (!trimmed) {
        const error: ApiError = { message: "Message is required" };
        return Promise.reject(error);
    }

    const response = await api.post<LlmChatResponse>(
        "/llm/chat/",
        {
            message: trimmed,
            conversation_id: conversationId,
        } satisfies LlmChatRequest,
        { requireAuth: true, signal }
    );

    return response.data;
}

export function llmChatStream(
    message: string,
    conversationId: number | null | undefined,
    onChunk: (text: string, conversationId: number) => void,
    onDone: (conversationId: number) => void,
    onError: (err: string) => void
): () => void {
    let active = true;
    let es: any = null;
    let queue: string[] = [];
    let streamEnded = false;
    let lastConversationId = conversationId || 0;
    let intervalId: any = null;

    const processQueue = () => {
        if (!active) {
            if (intervalId) {
                clearInterval(intervalId);
            }
            return;
        }
        if (queue.length > 0) {
            const batchSize = queue.length > 150 ? 12 : queue.length > 50 ? 6 : 2;
            const chunk = queue.splice(0, batchSize).join("");
            onChunk(chunk, lastConversationId);
        } else if (streamEnded) {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            onDone(lastConversationId);
        }
    };

    intervalId = setInterval(processQueue, 20);

    const run = async () => {
        try {
            const { accessToken } = await getTokens();
            if (!active) return;

            const params = [];
            params.push(`message=${encodeURIComponent(message.trim())}`);
            if (conversationId) {
                params.push(`conversation_id=${encodeURIComponent(String(conversationId))}`);
            }
            const queryString = params.join("&");
            const url = `${api.defaults.baseURL}/llm/chat/stream/?${queryString}`;

            es = new EventSource(url, {
                headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            });

            es.addEventListener("message", (event: any) => {
                if (!active) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.conversation_id) {
                        lastConversationId = data.conversation_id;
                    }
                    if (data.text) {
                        queue.push(...data.text.split(""));
                    }
                    if (data.done) {
                        streamEnded = true;
                        es.close();
                    }
                } catch (e) {
                    onError("Failed to parse stream data");
                }
            });

            es.addEventListener("error", (event: any) => {
                if (!active) return;
                onError(event.message || "Stream error occurred");
                es.close();
            });
        } catch (e: any) {
            if (active) {
                onError(e.message || "Failed to initialize stream");
            }
        }
    };

    run();

    return () => {
        active = false;
        if (intervalId) {
            clearInterval(intervalId);
        }
        if (es) {
            es.close();
        }
    };
}


export async function getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>("/llm/conversations/", { requireAuth: true });
    return response.data;
}

export async function getConversationMessages(conversationId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/llm/conversations/${conversationId}/messages/`, { requireAuth: true });
    return response.data;
}
