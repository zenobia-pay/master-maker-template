import { createSignal, Show, Match, Switch, createMemo } from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { ProjectProvider, useProject } from "../contexts/ProjectContext";
import PrimarySidebar from "./panels/PrimarySidebar";
import RightSidebar from "./panels/RightSidebar";
import ToolbarPanel from "./panels/ToolbarPanel";
import LibraryPanel from "./panels/LibraryPanel";
import PreviewPanel from "./panels/PreviewPanel";
import PropertiesPanel from "./panels/PropertiesPanel";
import AssistantPanel from "./panels/AssistantPanel";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
}

const authClient = createAuthClient({
  baseURL: window.location.origin,
});

// Main Project component that uses the context
function ProjectCore(props: { user: User }) {
  const { store, actions } = useProject();

  return (
    <div
      class="h-screen flex flex-col font-manrope overflow-hidden"
      style={{
        "overscroll-behavior": "contain",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Main Layout */}
      <div class="flex h-full overflow-hidden">
        {/* Icon Navigation Sidebar */}
        <PrimarySidebar />

        {/* Main Content Area */}
        <div class="flex-1 flex h-full overflow-hidden">
          {/* Center Panel */}
          <div
            class="flex-1 flex flex-col h-full overflow-hidden"
            style={{ background: "var(--color-bg-primary)" }}
          >
            {/* Toolbar */}
            <ToolbarPanel />

            {/* Main content area */}
            <div
              class="h-full flex flex-col relative overflow-auto custom-scrollbar"
              style={{ height: "calc(100% - 56px)" }}
            >
              <Switch>
                <Match when={store.viewMode === "library"}>
                  <LibraryPanel />
                </Match>
                <Match when={store.viewMode === "editor"}>
                  <div class="flex-1 flex flex-col">
                    <PreviewPanel />
                  </div>
                </Match>
              </Switch>
            </div>
          </div>

          {/* Unified Right Sidebar */}
          <div class="flex">
            <RightSidebar />

            {/* Unified Sidebar Container - Only animates on open/close */}
            <div
              class="transition-all duration-300 ease-in-out border-l h-full overflow-hidden"
              style={{
                width: store.sidebarShown ? `${store.sidebarWidth}px` : "0px",
                "border-color": "var(--color-border)",
                background: "var(--color-bg-surface-primary)",
              }}
            >
              <Show when={store.sidebarShown === "properties"}>
                <PropertiesPanel />
              </Show>
              <Show when={store.sidebarShown === "assistant"}>
                <AssistantPanel />
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectApp() {
  const session = authClient.useSession();

  // Extract projectId from URL query parameter
  const projectId = createMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  });

  return (
    <>
      <Switch>
        <Match when={session().isPending}>
          <div class="loading-overlay">
            <div class="spinner" />
          </div>
        </Match>

        <Match when={session()?.data}>
          <Show
            when={projectId()}
            fallback={
              <div class="error-overlay">
                <div class="error-card">
                  <h2>Invalid Project URL</h2>
                  <p>
                    Please navigate to a specific project from the{" "}
                    <a href="/">project selection page</a>.
                  </p>
                </div>
              </div>
            }
          >
            <ProjectProvider
              projectId={projectId()!}
              projectName="Sample Project"
            >
              <ProjectCore user={session()!.data!.user as User} />
            </ProjectProvider>
          </Show>
        </Match>

        <Match when={!session()?.data && !session().isPending}>
          {(window.location.href = "/")}
          <div>Redirecting...</div>
        </Match>
      </Switch>
    </>
  );
}
