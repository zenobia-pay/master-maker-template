import { For, Show, createSignal } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function LibraryPanel() {
  const { store, actions } = useProject();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showAddDialog, setShowAddDialog] = createSignal(false);

  const filteredSamples = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return store.samples;
    return store.samples.filter((s) => s.name.toLowerCase().includes(query));
  };

  return (
    <div
      class="flex-1 p-6 overflow-auto"
      style={{ background: "var(--color-bg-surface-primary)" }} data-xid="8DG0-pgK">

      <div class="max-w-6xl mx-auto" data-xid="v_sNfMo_">
        <div class="flex items-center justify-between mb-6" data-xid="8f9ol7YR">
          <h2
            class="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }} data-xid="SAeoB0Et">

            Sample m
          </h2>
          <button
            onClick={() => setShowAddDialog(true)}
            class="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{
              background: "var(--color-3000-400)",
              color: "var(--color-bg-surface-primary)"
            }} data-xid="32cHe8CI">

            Add Sample
          </button>
        </div>

        <div class="mb-6" data-xid="o8LsRRzq">
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              background: "var(--color-bg-surface-secondary)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)"
            }} data-xid="AiidmVNm" />

        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-xid="pLhleiJf">
          <For each={filteredSamples()} data-xid="0ymYRtVi">
            {(sample) =>
            <div
              class="rounded-lg p-4 cursor-pointer transition-all border-2 group relative"
              style={{
                background: "var(--color-bg-surface-secondary)",
                "border-color":
                store.selectedSampleId === sample.id ?
                "var(--color-3000-400)" :
                "transparent"
              }}
              onClick={() => actions.selectSample(sample.id)} data-xid="Z0o8kqB5">

                <div
                class="aspect-square rounded-md mb-3 flex items-center justify-center"
                style={{ background: "var(--color-bg-surface-tertiary)" }} data-xid="RFT3a440">

                  <Show
                  when={sample.type === "audio"}
                  fallback={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    style={{ color: "var(--color-text-muted)" }} data-xid="5jWqTIT3">

                        <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="2.18"
                      ry="2.18" data-xid="w9LKGOvu" />

                        <line x1="7" y1="2" x2="7" y2="22" data-xid="Q_mW_u5V" />
                        <line x1="17" y1="2" x2="17" y2="22" data-xid="gf5dGpnu" />
                        <line x1="2" y1="12" x2="22" y2="12" data-xid="1ZJ8h-yR" />
                        <line x1="2" y1="7" x2="7" y2="7" data-xid="xmkKOmhm" />
                        <line x1="2" y1="17" x2="7" y2="17" data-xid="ICIZTrSa" />
                        <line x1="17" y1="17" x2="22" y2="17" data-xid="P0rVf0m_" />
                        <line x1="17" y1="7" x2="22" y2="7" data-xid="yIJ88HQ9" />
                      </svg>
                  } data-xid="KcMHYsMD">

                    <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    style={{ color: "var(--color-text-muted)" }} data-xid="5jWqTIT3">

                      <path d="M9 18V5l12-2v13" data-xid="w9LKGOvu" />
                      <circle cx="6" cy="18" r="3" data-xid="Q_mW_u5V" />
                      <circle cx="18" cy="16" r="3" data-xid="gf5dGpnu" />
                    </svg>
                  </Show>
                </div>
                <h3
                class="font-medium truncate"
                style={{ color: "var(--color-text-primary)" }} data-xid="JRZRYO8T">

                  {sample.name}
                </h3>
                <div class="flex items-center justify-between mt-2" data-xid="wlLpSnIx">
                  <span
                  class="text-xs"
                  style={{ color: "var(--color-text-muted)" }} data-xid="Ddp1grpP">

                    {sample.duration || 0}s
                  </span>
                  <span
                  class="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "var(--color-bg-surface-tertiary)",
                    color: "var(--color-text-secondary)"
                  }} data-xid="hx1xfpJl">

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
                title="Remove sample" data-xid="buX_qd-E">

                  <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2" data-xid="7kqTgLOr">

                    <path d="M3 6h18" data-xid="mdbw8WJ_" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" data-xid="rDeAv1Op" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 1 2v2" data-xid="VVf2Tf6x" />
                    <line x1="10" y1="11" x2="10" y2="17" data-xid="G3FqLGWP" />
                    <line x1="14" y1="11" x2="14" y2="17" data-xid="1PIB-g_x" />
                  </svg>
                </button>
              </div>
            }
          </For>
        </div>

        <Show when={filteredSamples().length === 0} data-xid="EQEzZxsP">
          <div class="text-center py-12" data-xid="hyeDDjSu">
            <p style={{ color: "var(--color-text-muted)" }} data-xid="fk8Gexoj">
              {searchQuery() ?
              "No samples found matching your search" :
              "No samples in library"}
            </p>
            <Show when={!searchQuery()} data-xid="JajjF243">
              <button
                onClick={() => setShowAddDialog(true)}
                class="mt-4 px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{
                  background: "var(--color-3000-400)",
                  color: "var(--color-bg-surface-primary)"
                }} data-xid="2gEumx2N">

                Add Sample
              </button>
            </Show>
          </div>
        </Show>

        {/* Add Sample Dialog */}
        <Show when={showAddDialog()} data-xid="GXc6Fdxz">
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-xid="hW6lKKi6">
            <div
              class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              style={{ background: "var(--color-bg-surface-primary)" }} data-xid="Ox8sWXgk">

              <h3
                class="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }} data-xid="adXY9TdY">

                Add New Sample
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const name = formData.get("name") as string;
                  const type = formData.get("type") as "audio" | "video";

                  if (name.trim()) {
                    actions.addSample({
                      name: name.trim(),
                      type,
                      duration: 1.0
                    });
                    setShowAddDialog(false);
                  }
                }}
                class="space-y-4" data-xid="h-XkV_LI">

                <div data-xid="1b6-Ixkg">
                  <label
                    class="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }} data-xid="MATe0Bwd">

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
                      border: "1px solid var(--color-border)"
                    }}
                    placeholder="Enter sample name..." data-xid="3z0e4Af7" />

                </div>
                <div data-xid="6KOxCQJy">
                  <label
                    class="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-primary)" }} data-xid="WCT6E3Cn">

                    Type
                  </label>
                  <select
                    name="type"
                    class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      background: "var(--color-bg-surface-secondary)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)"
                    }} data-xid="fnmGdFhB">

                    <option value="audio" data-xid="pNIPFoin">Audio</option>
                    <option value="video" data-xid="pbxgShdS">Video</option>
                  </select>
                </div>
                <div class="flex gap-3 pt-4" data-xid="r54DlNmC">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    class="flex-1 py-2 rounded-lg transition-colors"
                    style={{
                      background: "var(--color-bg-surface-secondary)",
                      color: "var(--color-text-primary)",
                      border: "1px solid var(--color-border)"
                    }} data-xid="q9rGG3oT">

                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 py-2 rounded-lg transition-colors hover:opacity-90"
                    style={{
                      background: "var(--color-3000-400)",
                      color: "var(--color-bg-surface-primary)"
                    }} data-xid="OJ7bIZ6m">

                    Add Sample
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>
      </div>
    </div>);

}