import { createSignal, createResource, For, Show } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { apiClient } from "../utils/api/client";

const authClient = createAuthClient({
  baseURL: window.location.origin
});

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return "just now";
}

export default function ProjectSelector() {
  const [isCreating, setIsCreating] = createSignal(false);
  const [error, setError] = createSignal("");
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  // Check if current user has admin role
  const session = authClient.useSession();
  const isAdmin = () => {
    const userData = session()?.data?.user;
    // Check if user has admin role (from email whitelist)
    const userWithRole = userData as {role?: string;} | undefined;
    console.log("Got use role", userWithRole?.role);
    return userData && userWithRole?.role === "admin";
  };

  const [projects, { refetch }] = createResource(async () => {
    return await apiClient.getProjects();
  });

  const createProject = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsCreating(true);
    setError("");
    try {
      await apiClient.createProject({ name: trimmed });
      await refetch();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const onClickCreate = async () => {
    const defaultName = "Untitled Project";
    const name = window.prompt("Project name", defaultName);
    if (name !== null) {
      await createProject(name);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setDeletingId(id);
      await apiClient.deleteProject(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeletingId(null);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      // Refresh the page to ensure clean state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      class="min-h-screen grid grid-cols-[260px_1fr] font-manrope"
      style={{
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)"
      }} data-xid="0Iurk7jl">

      {/* Sidebar */}
      <aside
        class="h-screen sticky top-0 flex flex-col border-r"
        style={{
          background: "var(--color-bg-surface-primary)",
          "border-color": "var(--color-border)"
        }} data-xid="39z752bh">

        <div
          class="h-14 px-4 flex items-center border-b"
          style={{ "border-color": "var(--color-border)" }} data-xid="pi97jhmT">

          <a
            href="/"
            class="flex items-center gap-2 font-semibold"
            style={{ color: "var(--color-text-primary)" }} data-xid="sb82Zk0T">

            <div class="w-6 h-6 rounded bg-orange-500" data-xid="N-GTinL-" />
            <span data-xid="GaKRNYmg">Untitled</span>
          </a>
        </div>
        <nav class="flex-1 p-3 space-y-2" data-xid="Ypvwh0XN">
          <a
            href="#"
            class="block px-3 py-2 rounded-md text-sm transition-colors"
            style={{
              background: "var(--color-bg-surface-tertiary)",
              border: "1px solid var(--color-border)"
            }} data-xid="7LwEEb5d">

            Projects
          </a>
          <Show when={isAdmin()} data-xid="1v7EUXGN">
            <a
              href="/admin"
              class="block px-3 py-2 rounded-md text-sm text-orange-600 transition-colors hover:opacity-80"
              style={{
                border: "1px solid var(--color-border)"
              }} data-xid="nzVIqrrf">

              Admin Dashboard
            </a>
          </Show>
        </nav>
        <div class="p-4 pt-0 text-xs" data-xid="h-m3Y7ut">
          <button
            class="transition-colors hover:text-orange-500"
            style={{ color: "var(--color-text-muted)" }}
            onClick={logout} data-xid="9vAUPkgh">

            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main class="min-h-screen" data-xid="pldKh25Q">
        <div
          class="h-14 px-6 flex items-center justify-between border-b"
          style={{
            "border-color": "var(--color-border)",
            background: "var(--color-bg-surface-secondary)"
          }} data-xid="sSzvOKRN">

          <h1 class="text-lg font-semibold" data-xid="bYZ15PdF">Projects</h1>
          <button
            onClick={onClickCreate}
            disabled={isCreating()}
            class="px-4 py-2 font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50" data-xid="Gbwfmevo">

            + Create
          </button>
        </div>

        <div class="p-6 space-y-3" data-xid="QcjR9Rbi">
          <Show when={error()} data-xid="ZE7hI8S0">
            <div class="text-sm text-red-500" data-xid="2bnCFFKs">{error()}</div>
          </Show>

          <div class="space-y-1" data-xid="t8nGbSJm">
            <div
              class="grid grid-cols-[3rem_1fr_12rem_12rem_10rem] px-2 text-xs"
              style={{ color: "var(--color-text-muted)" }} data-xid="l86EFMkg">

              <div data-xid="Ya1p4w8-">#</div>
              <div data-xid="R_UOt-92">Name</div>
              <div data-xid="Iv2NaB9J">Created</div>
              <div data-xid="Xf1Rr-nC">Last Updated</div>
              <div class="text-right pr-2" data-xid="RGi6KXGb">Actions</div>
            </div>
            <div
              class="border-t"
              style={{ "border-color": "var(--color-border)" }} data-xid="9pAi-VKY" />

            <Show
              when={!projects.loading}
              fallback={
              <div
                class="flex items-center justify-center py-8"
                style={{ color: "var(--color-text-muted)" }} data-xid="7BOukOcM">

                  <div class="animate-spin rounded-full border-b-2 border-orange-500 h-8 w-8" data-xid="ncr4Ujq7" />
                  <span class="ml-2" data-xid="ivXETjYB">Loading projects...</span>
                </div>
              } data-xid="xFIcJdqY">

              <Show
                when={projects()?.projects && projects()!.projects.length > 0}
                fallback={
                <div class="flex flex-col items-center justify-center py-16 px-8" data-xid="ncr4Ujq7">
                    <div
                    class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: "var(--color-bg-surface-tertiary)" }} data-xid="Xp5bAcW7">

                      <svg
                      class="w-10 h-10 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24" data-xid="WxOlU7CZ">

                        <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4" data-xid="EtEDfdE3" />

                      </svg>
                    </div>
                    <h2
                    class="text-2xl font-bold mb-2"
                    style={{ color: "var(--color-text-primary)" }} data-xid="fwY0oIqk">

                      No projects yet
                    </h2>
                    <p
                    class="text-center mb-6 max-w-md"
                    style={{ color: "var(--color-text-muted)" }} data-xid="6i6UnVB0">

                      Get started by creating your first project.
                    </p>
                    <button
                    onClick={onClickCreate}
                    disabled={isCreating()}
                    class="px-6 py-3 font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl" data-xid="7FXXOL8a">

                      Create your first project
                    </button>
                  </div>
                } data-xid="7BOukOcM">

                <For each={projects()?.projects} data-xid="ncr4Ujq7">
                  {(project, index) =>
                  <a
                    href={`/project/?id=${project.id}`}
                    class="grid grid-cols-[3rem_1fr_12rem_12rem_10rem] items-center py-2 px-2 transition-colors rounded hover:bg-opacity-5 hover:bg-black"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                      "var(--color-bg-surface-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }} data-xid="Xp5bAcW7">

                      <div style={{ color: "var(--color-text-muted)" }} data-xid="WxOlU7CZ">
                        {index() + 1}
                      </div>
                      <div data-xid="KTdenRc9">{project.name}</div>
                      <div style={{ color: "var(--color-text-muted)" }} data-xid="xJIzEKKe">
                        {formatRelativeTime(new Date(project.createdAt))}
                      </div>
                      <div style={{ color: "var(--color-text-muted)" }} data-xid="PWHTptuh">
                        {formatRelativeTime(new Date(project.updatedAt))}
                      </div>
                      <div class="flex items-center justify-end gap-3 pr-2" data-xid="yW01t-N0">
                        <button
                        class="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                        disabled={deletingId() === project.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteProject(project.id);
                        }} data-xid="1ofnRA8A">

                          {deletingId() === project.id ?
                        "Deleting..." :
                        "Delete"}
                        </button>
                      </div>
                    </a>
                  }
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </main>
    </div>);

}