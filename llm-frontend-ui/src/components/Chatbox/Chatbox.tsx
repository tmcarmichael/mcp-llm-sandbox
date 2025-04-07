import { KeyboardEvent, ChangeEvent } from "react";
import { useLocalLLMChat } from "../../hooks/useLocalLLMChat";
import styles from "./Chatbox.module.css";

function Chatbox() {
  const { messages, inputText, loading, setInputText, handleSend } = useLocalLLMChat();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  return (
    <div className={styles.container}>
      {/* Header area */}
      <div className={styles.header}>
        <h2 className={styles.title}>MCP Scaffold - LLM Chat</h2>
      </div>

      {/* Loading state */}
      {loading && messages.length === 0 && <div className={styles.loading}>Loading model...</div>}

      {/* Chat area */}
      <div className={styles.chatArea}>
        {messages.map((msg: any, idx: any) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble].join(
                " "
              )}
            >
              <div className={styles.bubbleText}>{msg.content}</div>
            </div>
          );
        })}
      </div>

      {/* Text input */}
      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <textarea
            className={styles.textArea}
            rows={2}
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
          />
          <button onClick={handleSend} disabled={loading} className={styles.sendButton}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbox;
