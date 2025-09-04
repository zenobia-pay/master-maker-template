import { For, Show, createSignal } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function LibraryPanel() {
  const { store, actions } = useProject();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showAddDialog, setShowAddDialog] = createSignal(false);

  const filteredSamples = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return store.samples;
    return store.samples.filter(s => 
      s.name.toLowerCase().includes(query)
    );
  };

  return (
    <div 
      class="flex-1 p-6 overflow-auto"
      style={{ background: "var(--color-bg-surface-primary)" }}
    >
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Sample Library
          </h2>
          <button 
            onClick={() => setShowAddDialog(true)}
            class="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{
              background: "var(--color-3000-400)",
              color: "var(--color-bg-surface-primary)",
            }}
          >
            Add Sample
          </button>
        </div>

        <div class="mb-6">
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              background: "var(--color-bg-surface-secondary)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <For each={filteredSamples()}>
            {(sample) => (
              <div
                class="rounded-lg p-4 cursor-pointer transition-all border-2 group relative"
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
                    {sample.duration || 0}s
                  </span>
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      background: "var(--color-bg-surface-tertiary)",
                      color: "var(--color-text-secondary)"
                    }}
                  >
                    {sample.type || "audio"}
                  </span>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.removeSample(sample.id);
                  }}
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                  style={{ color: "var(--color-text-muted)" }}
                  title="Remove sample"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 1 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            )}
          </For>
        </div>

        <Show when={filteredSamples().length === 0}>
          <div class="text-center py-12">
            <p style={{ color: "var(--color-text-muted)" }}>
              {searchQuery() ? "No samples found matching your search" : "No samples in library"}
            </p>
            <Show when={!searchQuery()}>
              <button 
                onClick={() => setShowAddDialog(true)}
                class="mt-4 px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{
                  background: "var(--color-3000-400)",
                  color: "var(--color-bg-surface-primary)",
                }}
              >
                Add Sample
              </button>
            </Show>
          </div>
        </Show>

        {/* Add Sample Dialog */}
        <Show when={showAddDialog()}>
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div 
              class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              style={{ background: "var(--color-bg-surface-primary)" }}
            >
              <h3 class="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Add New Sample
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const name = formData.get('name') as string;
                  const type = formData.get('type') as 'audio' | 'video';
                  
                  if (name.trim()) {
                    actions.addSample({
                      name: name.trim(),
                      type,
                      duration: 1.0,
                    });
                    setShowAddDialog(false);
                  }
                }}
                class="space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Sample Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      background: "var(--color-bg-surface-secondary)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)",
                    }}
                    placeholder="Enter sample name..."
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Type
                  </label>
                  <select
                    name="type"
                    class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      background: "var(--color-bg-surface-secondary)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    class="flex-1 py-2 rounded-lg transition-colors"
                    style={{
                      background: "var(--color-bg-surface-secondary)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 py-2 rounded-lg transition-colors hover:opacity-90"
                    style={{
                      background: "var(--color-3000-400)",
                      color: "var(--color-bg-surface-primary)",
                    }}
                  >
                    Add Sample
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}