import { createSignal, createResource, For, Show } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { apiClient } from "../utils/api/client";

const authClient = createAuthClient({
  baseURL: window.location.origin,
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
    const userWithRole = userData as { role?: string } | undefined;
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
        color: "var(--color-text-primary)",
      }}
    >
      {/* Sidebar */}
      <aside
        class="h-screen sticky top-0 flex flex-col border-r"
        style={{
          background: "var(--color-bg-surface-primary)",
          "border-color": "var(--color-border)",
        }}
      >
        <div
          class="h-14 px-4 flex items-center border-b"
          style={{ "border-color": "var(--color-border)" }}
        >
          <a
            href="/"
            class="flex items-center gap-2 font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            <div class="w-6 h-6 rounded bg-orange-500" />
            <span>Untitled</span>
          </a>
        </div>
        <nav class="flex-1 p-3 space-y-2">
          <a
            href="#"
            class="block px-3 py-2 rounded-md text-sm transition-colors"
            style={{
              background: "var(--color-bg-surface-tertiary)",
              border: "1px solid var(--color-border)",
            }}
          >
            Projects
          </a>
          <Show when={isAdmin()}>
            <a
              href="/admin"
              class="block px-3 py-2 rounded-md text-sm text-orange-600 transition-colors hover:opacity-80"
              style={{
                border: "1px solid var(--color-border)",
              }}
            >
              Admin Dashboard
            </a>
          </Show>
        </nav>
        <div class="p-4 pt-0 text-xs">
          <button
            class="transition-colors hover:text-orange-500"
            style={{ color: "var(--color-text-muted)" }}
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main class="min-h-screen">
        <div
          class="h-14 px-6 flex items-center justify-between border-b"
          style={{
            "border-color": "var(--color-border)",
            background: "var(--color-bg-surface-secondary)",
          }}
        >
          <h1 class="text-lg font-semibold">Projects</h1>
          <button
            onClick={onClickCreate}
            disabled={isCreating()}
            class="px-4 py-2 font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            + Create
          </button>
        </div>

        <div class="p-6 space-y-3">
          <Show when={error()}>
            <div class="text-sm text-red-500">{error()}</div>
          </Show>

          <div class="space-y-1">
            <div
              class="grid grid-cols-[3rem_1fr_12rem_12rem_10rem] px-2 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              <div>#</div>
              <div>Name</div>
              <div>Created</div>
              <div>Last Updated</div>
              <div class="text-right pr-2">Actions</div>
            </div>
            <div
              class="border-t"
              style={{ "border-color": "var(--color-border)" }}
            />
            <Show
              when={!projects.loading}
              fallback={
                <div
                  class="flex items-center justify-center py-8"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <div class="animate-spin rounded-full border-b-2 border-orange-500 h-8 w-8" />
                  <span class="ml-2">Loading projects...</span>
                </div>
              }
            >
              <Show
                when={projects()?.projects && projects()!.projects.length > 0}
                fallback={
                  <div class="flex flex-col items-center justify-center py-16 px-8">
                    <div
                      class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "var(--color-bg-surface-tertiary)" }}
                    >
                      <svg
                        class="w-10 h-10 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <h2
                      class="text-2xl font-bold mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      No projects yet
                    </h2>
                    <p
                      class="text-center mb-6 max-w-md"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Get started by creating your first project.
                    </p>
                    <button
                      onClick={onClickCreate}
                      disabled={isCreating()}
                      class="px-6 py-3 font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      Create your first project
                    </button>
                  </div>
                }
              >
                <For each={projects()?.projects}>
                  {(project, index) => (
                    <a
                      href={`/project?id=${project.id}`}
                      class="grid grid-cols-[3rem_1fr_12rem_12rem_10rem] items-center py-2 px-2 transition-colors rounded hover:bg-opacity-5 hover:bg-black"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--color-bg-surface-tertiary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{ color: "var(--color-text-muted)" }}>
                        {index() + 1}
                      </div>
                      <div>{project.name}</div>
                      <div style={{ color: "var(--color-text-muted)" }}>
                        {formatRelativeTime(
                          new Date(project.createdAt as Date)
                        )}
                      </div>
                      <div style={{ color: "var(--color-text-muted)" }}>
                        {formatRelativeTime(
                          new Date(project.updatedAt as Date)
                        )}
                      </div>
                      <div class="flex items-center justify-end gap-3 pr-2">
                        <button
                          class="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                          disabled={deletingId() === project.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                        >
                          {deletingId() === project.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </a>
                  )}
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </main>
    </div>
  );
}
