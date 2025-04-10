import { useState } from "react";

export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

export interface UseLocalLLMChat {
  messages: Message[];
  inputText: string;
  loading: boolean;
  setInputText: (text: string) => void;
  handleSend: () => Promise<void>;
}

export function useInferenceServerChat(): UseLocalLLMChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (loading) return;
    const text = inputText.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_INFERENCE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          max_new_tokens: 50,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantReply = data.generated_text ?? "[No response]";
      const assistantMessage: Message = { role: "assistant", content: assistantReply };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling inference server:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    inputText,
    loading,
    setInputText,
    handleSend,
  };
}
