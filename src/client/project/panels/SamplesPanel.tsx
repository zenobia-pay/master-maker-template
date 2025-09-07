import { For, createSignal, Show } from "solid-js";
import { useProject } from "../../contexts/ProjectContext";

export default function SamplesPanel() {
  const { store, actions } = useProject();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showAddDialog, setShowAddDialog] = createSignal(false);

  const filteredSamples = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return store.samples;
    return store.samples.filter((s) =>
    s.name.toLowerCase().includes(query)
    );
  };

  return (
    <div class="h-full flex flex-col" data-xid="RlRTtrVD">
      <div class="p-4 border-b" style={{ "border-color": "var(--color-border)" }} data-xid="mGQPuzMt">
        <div class="flex items-center justify-between mb-3" data-xid="n7JyLuna">
          <h2 class="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }} data-xid="6eauW_gS">
            Samples
          </h2>
          <button
            onClick={() => actions.toggleSidebar(null)}
            class="transition-colors hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }} data-xid="r7Kiy-Cd">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-xid="nv9CvP9S">
              <line x1="18" y1="6" x2="6" y2="18" data-xid="Rn4QVeWY" />
              <line x1="6" y1="6" x2="18" y2="18" data-xid="deay2_HI" />
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
            "border": "1px solid var(--color-border)"
          }} data-xid="gfhH3pPV" />

      </div>

      <div class="flex-1 overflow-auto p-4" data-xid="8GwcDn0f">
        <div class="space-y-2" data-xid="qlCLK05w">
          <For each={filteredSamples()} data-xid="eS25UY9a">
            {(sample) =>
            <div
              class="p-3 rounded-lg cursor-pointer transition-all border-2 group"
              style={{
                background: "var(--color-bg-surface-secondary)",
                "border-color": store.selectedSampleId === sample.id ?
                "var(--color-3000-400)" :
                "transparent"
              }}
              onClick={() => actions.selectSample(sample.id)} data-xid="c7NBnyjv">

                <div class="flex items-center gap-3" data-xid="uVpErtCw">
                  <div
                  class="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: "var(--color-bg-surface-tertiary)" }} data-xid="5w-vbA-X">

                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                  style={{ color: store.selectedSampleId === sample.id ? "var(--color-3000-400)" : "var(--color-text-muted)" }} data-xid="Z48noNuz">

                      {sample.type === "audio" ?
                    <>
                          <path d="M9 18V5l12-2v13" data-xid="lJ_jZfkl" />
                          <circle cx="6" cy="18" r="3" data-xid="IV7HiTzw" />
                          <circle cx="18" cy="16" r="3" data-xid="ndWuKRKU" />
                        </> :

                    <>
                          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" data-xid="lJ_jZfkl" />
                          <line x1="7" y1="2" x2="7" y2="22" data-xid="IV7HiTzw" />
                          <line x1="17" y1="2" x2="17" y2="22" data-xid="ndWuKRKU" />
                        </>
                    }
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0" data-xid="-5gQFwdg">
                    <p class="font-medium truncate" style={{ color: "var(--color-text-primary)" }} data-xid="SS5GsG8w">
                      {sample.name}
                    </p>
                    <p class="text-xs" style={{ color: "var(--color-text-muted)" }} data-xid="MXiNpftB">
                      {sample.type || "audio"} • {sample.duration || 0}s
                    </p>
                  </div>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.removeSample(sample.id);
                  }}
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                  style={{ color: "var(--color-text-muted)" }}
                  title="Remove sample" data-xid="skb-IjQt">

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-xid="LK3gHl_I">
                      <path d="M3 6h18" data-xid="_E8doQg6" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" data-xid="RxdubztQ" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 1 2v2" data-xid="TcZbp90W" />
                      <line x1="10" y1="11" x2="10" y2="17" data-xid="6HwODtYj" />
                      <line x1="14" y1="11" x2="14" y2="17" data-xid="cv7WVDz_" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </For>
        </div>
      </div>

      <div class="p-4 border-t" style={{ "border-color": "var(--color-border)" }} data-xid="aD8OPfjf">
        <button
          onClick={() => setShowAddDialog(true)}
          class="w-full py-2 rounded-lg transition-colors hover:opacity-90"
          style={{
            background: "var(--color-3000-400)",
            color: "var(--color-bg-surface-primary)"
          }} data-xid="y-ROrNGd">

          Add Sample
        </button>
      </div>

      {/* Add Sample Dialog */}
      <Show when={showAddDialog()} data-xid="q9o_5Pk0">
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-xid="iHc63W-g">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            style={{ background: "var(--color-bg-surface-primary)" }} data-xid="KDGSzeRd">

            <h3 class="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }} data-xid="ZTIKIQg2">
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
                    duration: 1.0
                  });
                  setShowAddDialog(false);
                }
              }}
              class="space-y-4" data-xid="_Z3mN8zd">

              <div data-xid="7S1IibHF">
                <label class="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }} data-xid="kZSxmZDK">
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
                  placeholder="Enter sample name..." data-xid="ZxzqYfv-" />

              </div>
              <div data-xid="DFPak4ts">
                <label class="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }} data-xid="MiOlT2fT">
                  Type
                </label>
                <select
                  name="type"
                  class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--color-bg-surface-secondary)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)"
                  }} data-xid="ug-RvV5D">

                  <option value="audio" data-xid="E78eXWZZ">Audio</option>
                  <option value="video" data-xid="aAXnFuK5">Video</option>
                </select>
              </div>
              <div class="flex gap-3 pt-4" data-xid="CqMnda0N">
                <button
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  class="flex-1 py-2 rounded-lg transition-colors"
                  style={{
                    background: "var(--color-bg-surface-secondary)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)"
                  }} data-xid="lRdUsKhV">

                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{
                    background: "var(--color-3000-400)",
                    color: "var(--color-bg-surface-primary)"
                  }} data-xid="-3mH3m3Y">

                  Add Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>);

}