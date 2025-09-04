import { Show, For } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function PropertiesPanel() {
  const { store, actions, derived } = useProject();

  const properties = () => {
    const sample = derived.selectedSample();
    if (!sample) return [];
    
    return [
      { label: "Name", value: sample.name },
      { label: "Type", value: sample.type },
      { label: "Duration", value: `${sample.duration} seconds` },
      { label: "URL", value: sample.url },
      { label: "ID", value: sample.id },
    ];
  };

  return (
    <div class="h-full flex flex-col">
      <div class="p-4 border-b" style={{ "border-color": "var(--color-border)" }}>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Properties
          </h2>
          <button
            onClick={() => actions.toggleSidebar(null)}
            class="transition-colors hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-4">
        <Show
          when={derived.selectedSample()}
          fallback={
            <div class="text-center py-8">
              <p style={{ color: "var(--color-text-muted)" }}>No sample selected</p>
              <p class="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
                Select a sample to view its properties
              </p>
            </div>
          }
        >
          <div class="space-y-4">
            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }}>
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                Sample Info
              </h3>
              <div class="space-y-3">
                <For each={properties()}>
                  {(prop) => (
                    <div>
                      <label class="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {prop.label}
                      </label>
                      <p class="text-sm mt-1 truncate" style={{ color: "var(--color-text-primary)" }}>
                        {prop.value}
                      </p>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }}>
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                Preview
              </h3>
              <div 
                class="aspect-video rounded flex items-center justify-center"
                style={{ background: "var(--color-bg-surface-tertiary)" }}
              >
                <Show
                  when={derived.selectedSample()?.type === "audio"}
                  fallback={
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <line x1="7" y1="2" x2="7" y2="22"/>
                      <line x1="17" y1="2" x2="17" y2="22"/>
                    </svg>
                  }
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </Show>
              </div>
            </div>

            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }}>
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
                Actions
              </h3>
              <div class="space-y-2">
                <button 
                  class="w-full py-2 text-sm rounded transition-colors"
                  style={{
                    background: "var(--color-3000-400)",
                    color: "var(--color-bg-surface-primary)",
                  }}
                >
                  Add to Timeline
                </button>
                <button 
                  class="w-full py-2 text-sm rounded transition-colors"
                  style={{
                    background: "var(--color-3000-200)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Duplicate
                </button>
                <button 
                  class="w-full py-2 text-sm rounded transition-colors hover:opacity-80"
                  style={{
                    background: "#ef4444",
                    color: "white",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}