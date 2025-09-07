import { createSignal, For, Show, createEffect, onCleanup } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";
import User from "lucide-solid/icons/user";
import Trash2 from "lucide-solid/icons/trash-2";
import X from "lucide-solid/icons/x";

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
      timestamp: new Date()
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
        timestamp: new Date()
      };
      setMessages([...messages(), assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div class="font-manrope h-full flex flex-col" data-xid="ONm30wF7">
      {/* Add shimmer animation styles */}
      <style data-xid="zkEbAVTS">{`
        @keyframes shimmer {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      <div class="w-[400px] h-full flex flex-col" data-xid="MNyF88v0">
        {/* Header */}
        <div
          class="flex items-center justify-between px-4 py-3 border-b"
          style={{ "border-color": "var(--color-border)" }} data-xid="obRf9eqA">

          <div class="flex items-center gap-3" data-xid="lTHq9vPK">
            <User size={20} style={{ color: "var(--color-3000-400)" }} data-xid="33PonLBg" />
            <div data-xid="XhWp2IOh">
              <h3
                class="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }} data-xid="_HSBF9gP">

                AI Assistant
              </h3>
              <div class="text-xs" style={{ color: "var(--color-text-muted)" }} data-xid="kz2VEXN7">
                Sample Library Helper
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1" data-xid="fQjjyJEH">
            <Show when={messages().length > 0} data-xid="DQFRNVrG">
              <button
                onClick={clearChat}
                class="p-2 transition-all duration-200 hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
                title="Clear Chat" data-xid="KCVa-CRV">

                <Trash2 size={16} data-xid="7-sqsfbT" />
              </button>
            </Show>
            <button
              onClick={() => actions.toggleSidebar(null)}
              class="p-2 transition-all duration-200 hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
              title="Close" data-xid="w53K9lYj">

              <X size={16} data-xid="mRGPlteL" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3" data-xid="yOodcXht">
          <Show when={messages().length === 0} data-xid="RnchsEmg">
            <div class="text-center py-8" data-xid="mvKOlgAw">
              <p
                class="text-sm mb-4"
                style={{ color: "var(--color-text-muted)" }} data-xid="k8hPhmR_">

                I can help with your sample library and audio projects.
              </p>
              <div
                class="text-xs space-y-2"
                style={{ color: "var(--color-text-muted)" }} data-xid="uGn3WBB3">

                <div data-xid="tvhRxxUW">"Find kick drum samples"</div>
                <div data-xid="YWrvPpDE">"Organize by genre"</div>
                <div data-xid="1tcOOgcq">"Suggest sample combinations"</div>
              </div>
            </div>
          </Show>

          <For each={messages()} data-xid="TJuIIwj4">
            {(message) =>
            <div
              class={`mb-2 ${message.type === "user" ? "text-right" : "text-left"}`} data-xid="xh3EVBHT">

                <div
                class={`flex items-start gap-2 ${message.type === "user" ? "justify-end" : ""}`} data-xid="YGF012pe">

                  <Show when={message.type !== "user"} data-xid="7gAu9GGY">
                    <div
                    class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{
                      background:
                      message.type === "system" ?
                      "#10b981" // Green for system messages
                      : "var(--color-text-muted)"
                    }} data-xid="rPDj1lsP" />

                  </Show>
                  <div
                  class={`${message.type === "user" ? "max-w-[85%]" : "flex-1"} text-sm`}
                  style={{ color: "var(--color-text-primary)" }} data-xid="Oz5I8rgH">

                    <div class="whitespace-pre-wrap" data-xid="6SBEgdms">{message.content}</div>
                  </div>
                </div>
              </div>
            }
          </For>

          <Show when={isProcessing()} data-xid="MNeOsSRK">
            <div class="text-left mb-2" data-xid="u9mfpRIJ">
              <div class="flex items-start gap-2" data-xid="o2Wklt91">
                <div
                  class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 animate-pulse"
                  style={{ background: "#f97316" }} // Orange shimmer
                  data-xid="SHVPTOFP" />
                <div class="text-sm" data-xid="hSx2xEeG">
                  <span
                    class="animate-pulse"
                    style={{
                      color: "#f97316",
                      animation: "shimmer 2s ease-in-out infinite alternate"
                    }} data-xid="dkx-2wtH">

                    Thinking...
                  </span>
                  <span
                    class="text-xs ml-2 opacity-60"
                    style={{ color: "var(--color-text-muted)" }} data-xid="0bgoT5Cp">

                    (esc to interrupt)
                  </span>
                </div>
              </div>
            </div>
          </Show>

          <div ref={messagesEndRef} data-xid="X4MmciJt" />
        </div>

        {/* Input Area */}
        <div
          class="p-3"
          style={{ "border-top": "1px solid var(--color-border)" }} data-xid="4mn_7bhY">

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
              "max-height": "120px"
            }}
            rows="2" data-xid="qT7AndlW" />

        </div>
      </div>
    </div>);

}