import { createSignal, For, Show, createEffect, onCleanup } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";
import { User, Trash2, X } from "lucide-solid";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function AssistantPanel() {
  const { actions } = useProject();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [currentMessage, setCurrentMessage] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);

  let messagesEndRef: HTMLDivElement | undefined;

  // Auto-scroll to bottom when new messages arrive
  createEffect(() => {
    messages();
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: "smooth" });
    }
  });

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    const message = currentMessage().trim();
    if (!message || isProcessing()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages([...messages(), userMessage]);
    setCurrentMessage("");
    setIsProcessing(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you'd like help with: "${message}"\n\nThis is a simplified assistant for your sample library. I can help you with:\n• Finding specific samples\n• Organizing your library\n• Suggesting sample combinations\n• Basic audio editing tips`,
        timestamp: new Date(),
      };
      setMessages([...messages(), assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div class="font-manrope h-full flex flex-col">
      {/* Add shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      <div class="w-[400px] h-full flex flex-col">
        {/* Header */}
        <div
          class="flex items-center justify-between px-4 py-3 border-b"
          style={{ "border-color": "var(--color-border)" }}
        >
          <div class="flex items-center gap-3">
            <User size={20} style={{ color: "var(--color-3000-400)" }} />
            <div>
              <h3
                class="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                AI Assistant
              </h3>
              <div
                class="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Sample Library Helper
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <Show when={messages().length > 0}>
              <button
                onClick={clearChat}
                class="p-2 transition-all duration-200 hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
                title="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
            </Show>
            <button
              onClick={() => actions.toggleSidebar(null)}
              class="p-2 transition-all duration-200 hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          <Show when={messages().length === 0}>
            <div class="text-center py-8">
              <p
                class="text-sm mb-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                I can help with your sample library and audio projects.
              </p>
              <div
                class="text-xs space-y-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                <div>"Find kick drum samples"</div>
                <div>"Organize by genre"</div>
                <div>"Suggest sample combinations"</div>
              </div>
            </div>
          </Show>

          <For each={messages()}>
            {(message) => (
              <div
                class={`mb-2 ${message.type === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  class={`flex items-start gap-2 ${message.type === "user" ? "justify-end" : ""}`}
                >
                  <Show when={message.type !== "user"}>
                    <div
                      class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{
                        background:
                          message.type === "system"
                            ? "#10b981" // Green for system messages
                            : "var(--color-text-muted)",
                      }}
                    />
                  </Show>
                  <div
                    class={`${message.type === "user" ? "max-w-[85%]" : "flex-1"} text-sm`}
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <div class="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            )}
          </For>

          <Show when={isProcessing()}>
            <div class="text-left mb-2">
              <div class="flex items-start gap-2">
                <div
                  class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 animate-pulse"
                  style={{ background: "#f97316" }} // Orange shimmer
                />
                <div class="text-sm">
                  <span
                    class="animate-pulse"
                    style={{
                      color: "#f97316",
                      animation: "shimmer 2s ease-in-out infinite alternate",
                    }}
                  >
                    Thinking...
                  </span>
                  <span
                    class="text-xs ml-2 opacity-60"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    (esc to interrupt)
                  </span>
                </div>
              </div>
            </div>
          </Show>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          class="p-3"
          style={{ "border-top": "1px solid var(--color-border)" }}
        >
          <textarea
            value={currentMessage()}
            onInput={(e) => setCurrentMessage(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to do with your samples?"
            disabled={isProcessing()}
            class="w-full resize-none focus:outline-none bg-transparent text-sm"
            style={{
              color: "var(--color-text-primary)",
              "min-height": "60px",
              "max-height": "120px",
            }}
            rows="2"
          />
        </div>
      </div>
    </div>
  );
}