import { api, type ApiError } from "./api";

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

export async function getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>("/llm/conversations/", { requireAuth: true });
    return response.data;
}

export async function getConversationMessages(conversationId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/llm/conversations/${conversationId}/messages/`, { requireAuth: true });
    return response.data;
}
