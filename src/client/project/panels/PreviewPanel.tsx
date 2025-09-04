import { Show } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function PreviewPanel() {
  const { store, derived } = useProject();

  return (
    <div 
      class="flex items-center justify-center"
      style={{ 
        height: `${store.previewHeight}vh`,
        background: "var(--color-bg-primary)"
      }}
    >
      <Show
        when={derived.selectedSample()}
        fallback={
          <div class="text-center">
            <p style={{ color: "var(--color-text-muted)" }} class="mb-2">
              No sample selected
            </p>
            <p style={{ color: "var(--color-text-secondary)" }} class="text-sm">
              Select a sample to preview
            </p>
          </div>
        }
      >
        {(sample) => (
          <div class="text-center">
            <div 
              class="w-64 h-64 rounded-lg flex items-center justify-center mb-4"
              style={{ background: "var(--color-bg-surface-secondary)" }}
            >
              <Show
                when={sample().type === "audio"}
                fallback={
                  <video 
                    src={sample().url}
                    class="w-full h-full object-cover rounded-lg"
                    controls
                  />
                }
              >
                <div class="text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ color: "var(--color-text-muted)" }} class="mb-4 mx-auto">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                  <audio src={sample().url} controls class="mx-auto" />
                </div>
              </Show>
            </div>
            <h3 class="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {sample().name}
            </h3>
            <p style={{ color: "var(--color-text-muted)" }} class="mt-1">
              Duration: {sample().duration}s
            </p>
          </div>
        )}
      </Show>
    </div>
  );
}