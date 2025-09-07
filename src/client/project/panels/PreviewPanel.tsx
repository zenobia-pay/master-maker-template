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
      }} data-xid="FTvw8Cah">

      <Show
        when={derived.selectedSample()}
        fallback={
        <div class="text-center" data-xid="jw2Tx5i9">
            <p style={{ color: "var(--color-text-muted)" }} class="mb-2" data-xid="t-aVbKzl">
              No sample selected
            </p>
            <p style={{ color: "var(--color-text-secondary)" }} class="text-sm" data-xid="jr6DqHOj">
              Select a sample to preview
            </p>
          </div>
        } data-xid="4fPu6T8U">

        {(sample) =>
        <div class="text-center" data-xid="jw2Tx5i9">
            <div
            class="w-64 h-64 rounded-lg flex items-center justify-center mb-4"
            style={{ background: "var(--color-bg-surface-secondary)" }} data-xid="t-aVbKzl">

              <Show
              when={sample().type === "audio"}
              fallback={
              <video
                src={sample().url}
                class="w-full h-full object-cover rounded-lg"
                controls data-xid="GmKkQAOM" />

              } data-xid="G5fnVBIU">

                <div class="text-center" data-xid="GmKkQAOM">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ color: "var(--color-text-muted)" }} class="mb-4 mx-auto" data-xid="XX5LPkaY">
                    <path d="M9 18V5l12-2v13" data-xid="WyrzQjJL" />
                    <circle cx="6" cy="18" r="3" data-xid="zUwAoV-x" />
                    <circle cx="18" cy="16" r="3" data-xid="NRHCLD-O" />
                  </svg>
                  <audio src={sample().url} controls class="mx-auto" data-xid="rHzSEP1x" />
                </div>
              </Show>
            </div>
            <h3 class="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }} data-xid="jr6DqHOj">
              {sample().name}
            </h3>
            <p style={{ color: "var(--color-text-muted)" }} class="mt-1" data-xid="9krd4svn">
              Duration: {sample().duration}s
            </p>
          </div>
        }
      </Show>
    </div>);

}