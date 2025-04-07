import { useState, useEffect, useRef } from "react";
import { pipeline, Pipeline } from "@xenova/transformers";

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

export function useLocalLLMChat(): UseLocalLLMChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const pipelineRef = useRef<Pipeline | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const pipe = (await pipeline("text-generation", "Xenova/gpt2")) as any;
        if (isMounted) {
          pipelineRef.current = pipe;
        }
      } catch (err) {
        console.error("Error loading model:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    const pipe = pipelineRef.current;
    if (!pipe) return;
    try {
      setLoading(true);
      const output = await pipe(text, {});
      const assistantReply = output?.[0]?.generated_text || "[No response]";
      const assistantMessage: Message = { role: "assistant", content: assistantReply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Generation error:", err);
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
