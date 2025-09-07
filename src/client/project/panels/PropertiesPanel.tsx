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
    { label: "ID", value: sample.id }];

  };

  return (
    <div class="h-full flex flex-col" data-xid="1ywnMqpc">
      <div class="p-4 border-b" style={{ "border-color": "var(--color-border)" }} data-xid="WwmqdAJ-">
        <div class="flex items-center justify-between" data-xid="9kovqzre">
          <h2 class="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }} data-xid="ds9qjGFl">
            Properties
          </h2>
          <button
            onClick={() => actions.toggleSidebar(null)}
            class="transition-colors hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }} data-xid="J2HUdhXW">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-xid="V6_hI45m">
              <line x1="18" y1="6" x2="6" y2="18" data-xid="P5jS4uqJ" />
              <line x1="6" y1="6" x2="18" y2="18" data-xid="h80ErkSb" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-4" data-xid="V4pNg2LN">
        <Show
          when={derived.selectedSample()}
          fallback={
          <div class="text-center py-8" data-xid="RI_507CG">
              <p style={{ color: "var(--color-text-muted)" }} data-xid="B3OYdXI2">No sample selected</p>
              <p class="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }} data-xid="6eqBqj9L">
                Select a sample to view its properties
              </p>
            </div>
          } data-xid="TNF9iyJC">

          <div class="space-y-4" data-xid="RI_507CG">
            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }} data-xid="B3OYdXI2">
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }} data-xid="N_CdC-M8">
                Sample Info
              </h3>
              <div class="space-y-3" data-xid="DGMsi3P_">
                <For each={properties()} data-xid="Zw14Z9BC">
                  {(prop) =>
                  <div data-xid="YdxUlHOa">
                      <label class="text-xs" style={{ color: "var(--color-text-muted)" }} data-xid="JH4MV7xZ">
                        {prop.label}
                      </label>
                      <p class="text-sm mt-1 truncate" style={{ color: "var(--color-text-primary)" }} data-xid="5icOso-m">
                        {prop.value}
                      </p>
                    </div>
                  }
                </For>
              </div>
            </div>

            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }} data-xid="6eqBqj9L">
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }} data-xid="hfvT67uW">
                Preview
              </h3>
              <div
                class="aspect-video rounded flex items-center justify-center"
                style={{ background: "var(--color-bg-surface-tertiary)" }} data-xid="CilQoNht">

                <Show
                  when={derived.selectedSample()?.type === "audio"}
                  fallback={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                  style={{ color: "var(--color-text-muted)" }} data-xid="P1NXkU9j">

                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" data-xid="MAiIjU_a" />
                      <line x1="7" y1="2" x2="7" y2="22" data-xid="UqqaAxgp" />
                      <line x1="17" y1="2" x2="17" y2="22" data-xid="mkrXJMTX" />
                    </svg>
                  } data-xid="plQFoSSK">

                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                  style={{ color: "var(--color-text-muted)" }} data-xid="P1NXkU9j">

                    <path d="M9 18V5l12-2v13" data-xid="MAiIjU_a" />
                    <circle cx="6" cy="18" r="3" data-xid="UqqaAxgp" />
                    <circle cx="18" cy="16" r="3" data-xid="mkrXJMTX" />
                  </svg>
                </Show>
              </div>
            </div>

            <div class="rounded-lg p-4" style={{ background: "var(--color-bg-surface-secondary)" }} data-xid="y3V00mR9">
              <h3 class="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }} data-xid="RwhaW7K4">
                Actions
              </h3>
              <div class="space-y-2" data-xid="KyHf8IOW">
                <button
                  class="w-full py-2 text-sm rounded transition-colors"
                  style={{
                    background: "var(--color-3000-400)",
                    color: "var(--color-bg-surface-primary)"
                  }} data-xid="rB-ImT6n">

                  Add to Timeline
                </button>
                <button
                  class="w-full py-2 text-sm rounded transition-colors"
                  style={{
                    background: "var(--color-3000-200)",
                    color: "var(--color-text-primary)"
                  }} data-xid="AwJ-8Qpe">

                  Duplicate
                </button>
                <button
                  class="w-full py-2 text-sm rounded transition-colors hover:opacity-80"
                  style={{
                    background: "#ef4444",
                    color: "white"
                  }} data-xid="t1hioiEO">

                  Remove
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>);

}