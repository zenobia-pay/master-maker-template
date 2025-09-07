import { Show } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function ToolbarPanel() {
  const { store, actions, derived } = useProject();

  return (
    <div
      class="h-14 flex items-center px-4 gap-4 border-b"
      style={{
        background: "var(--color-bg-surface-primary)",
        "border-color": "var(--color-border)"
      }} data-xid="6sAEuZ_5">

      <div class="flex items-center gap-2" data-xid="G0qQ18iW">
        <h1 class="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }} data-xid="RLXkHQeF">
          {store.projectName}
        </h1>
      </div>

      <div class="flex items-center gap-2 ml-8" data-xid="hFFxfwXB">
        <button
          onClick={() => store.isPlaying ? actions.pause() : actions.play()}
          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: "var(--color-3000-400)",
            color: "var(--color-bg-surface-primary)"
          }} data-xid="tY3BGTHl">

          <Show
            when={store.isPlaying}
            fallback={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" data-xid="kDZraNld">
                <path d="M8 5v14l11-7z" data-xid="zLsB8e4F" />
              </svg>
            } data-xid="Kwy3p6a4">

            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" data-xid="kDZraNld">
              <rect x="6" y="4" width="4" height="16" data-xid="zLsB8e4F" />
              <rect x="14" y="4" width="4" height="16" data-xid="NNsuDtb8" />
            </svg>
          </Show>
        </button>
        <button
          onClick={() => actions.seek(0)}
          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
          style={{
            background: "var(--color-3000-200)",
            color: "var(--color-text-primary)"
          }} data-xid="pkcWSvw4">

          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" data-xid="6EKfxWae">
            <path d="M4 18V6h4l5 6-5 6H4zm11 0l-5-6 5-6v12z" data-xid="Qm4nruwQ" />
          </svg>
        </button>
      </div>

      <div class="ml-auto flex items-center gap-4" data-xid="IgBOK_d1">
        <div class="text-sm" style={{ color: "var(--color-text-muted)" }} data-xid="tWQabVbu">
          {derived.sampleCount()} samples
        </div>
        <Show when={store.selectedSampleId} data-xid="scAWZcY4">
          <div class="text-sm" style={{ color: "var(--color-3000-400)" }} data-xid="RhSxOx-p">
            Selected: {derived.selectedSample()?.name}
          </div>
        </Show>
      </div>
    </div>);

}