import { For, createSignal } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function SamplesPanel() {
  const { store, actions } = useProject();
  const [searchQuery, setSearchQuery] = createSignal("");

  const filteredSamples = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return store.samples;
    return store.samples.filter(s => 
      s.name.toLowerCase().includes(query)
    );
  };

  return (
    <div class="h-full flex flex-col">
      <div class="p-4 border-b" style={{ "border-color": "var(--color-border)" }}>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Samples
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
        <input
          type="text"
          placeholder="Search samples..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
          style={{
            background: "var(--color-bg-surface-secondary)",
            color: "var(--color-text-primary)",
            "border": "1px solid var(--color-border)",
          }}
        />
      </div>

      <div class="flex-1 overflow-auto p-4">
        <div class="space-y-2">
          <For each={filteredSamples()}>
            {(sample) => (
              <div
                class="p-3 rounded-lg cursor-pointer transition-all border-2"
                style={{
                  background: "var(--color-bg-surface-secondary)",
                  "border-color": store.selectedSampleId === sample.id 
                    ? "var(--color-3000-400)" 
                    : "transparent",
                }}
                onClick={() => actions.selectSample(sample.id)}
              >
                <div class="flex items-center gap-3">
                  <div 
                    class="w-10 h-10 rounded flex items-center justify-center"
                    style={{ background: "var(--color-bg-surface-tertiary)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
                      style={{ color: store.selectedSampleId === sample.id ? "var(--color-3000-400)" : "var(--color-text-muted)" }}
                    >
                      {sample.type === "audio" ? (
                        <>
                          <path d="M9 18V5l12-2v13"/>
                          <circle cx="6" cy="18" r="3"/>
                          <circle cx="18" cy="16" r="3"/>
                        </>
                      ) : (
                        <>
                          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                          <line x1="7" y1="2" x2="7" y2="22"/>
                          <line x1="17" y1="2" x2="17" y2="22"/>
                        </>
                      )}
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                      {sample.name}
                    </p>
                    <p class="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {sample.type} • {sample.duration}s
                    </p>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="p-4 border-t" style={{ "border-color": "var(--color-border)" }}>
        <button 
          class="w-full py-2 rounded-lg transition-colors"
          style={{
            background: "var(--color-3000-400)",
            color: "var(--color-bg-surface-primary)",
          }}
        >
          Add Sample
        </button>
      </div>
    </div>
  );
}