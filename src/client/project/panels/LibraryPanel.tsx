import { For, Show } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function LibraryPanel() {
  const { store, actions } = useProject();

  return (
    <div 
      class="flex-1 p-6 overflow-auto"
      style={{ background: "var(--color-bg-surface-primary)" }}
    >
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
          Sample Library
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <For each={store.samples}>
            {(sample) => (
              <div
                class="rounded-lg p-4 cursor-pointer transition-all border-2"
                style={{
                  background: "var(--color-bg-surface-secondary)",
                  "border-color": store.selectedSampleId === sample.id 
                    ? "var(--color-3000-400)" 
                    : "transparent",
                }}
                onClick={() => actions.selectSample(sample.id)}
              >
                <div 
                  class="aspect-square rounded-md mb-3 flex items-center justify-center"
                  style={{ background: "var(--color-bg-surface-tertiary)" }}
                >
                  <Show
                    when={sample.type === "audio"}
                    fallback={
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ color: "var(--color-text-muted)" }}>
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                        <line x1="7" y1="2" x2="7" y2="22"/>
                        <line x1="17" y1="2" x2="17" y2="22"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <line x1="2" y1="7" x2="7" y2="7"/>
                        <line x1="2" y1="17" x2="7" y2="17"/>
                        <line x1="17" y1="17" x2="22" y2="17"/>
                        <line x1="17" y1="7" x2="22" y2="7"/>
                      </svg>
                    }
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ color: "var(--color-text-muted)" }}>
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </Show>
                </div>
                <h3 class="font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {sample.name}
                </h3>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {sample.duration}s
                  </span>
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      background: "var(--color-bg-surface-tertiary)",
                      color: "var(--color-text-secondary)"
                    }}
                  >
                    {sample.type}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>

        <Show when={store.samples.length === 0}>
          <div class="text-center py-12">
            <p style={{ color: "var(--color-text-muted)" }}>No samples in library</p>
            <button 
              class="mt-4 px-4 py-2 rounded-lg transition-colors"
              style={{
                background: "var(--color-3000-400)",
                color: "var(--color-bg-surface-primary)",
              }}
            >
              Add Sample
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}