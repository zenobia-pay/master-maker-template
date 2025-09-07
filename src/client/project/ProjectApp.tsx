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
  baseURL: window.location.origin
});

// Main Project component that uses the context
function ProjectCore(props: {user: User;}) {
  const { store, actions } = useProject();

  return (
    <div
      class="h-screen flex flex-col font-manrope overflow-hidden"
      style={{
        "overscroll-behavior": "contain",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)"
      }} data-xid="IqpEBJJM">

      {/* Main Layout */}
      <div class="flex h-full overflow-hidden" data-xid="Xpwtqq0w">
        {/* Icon Navigation Sidebar */}
        <PrimarySidebar data-xid="hnBFba_d" />

        {/* Main Content Area */}
        <div class="flex-1 flex h-full overflow-hidden" data-xid="mOEoJn7D">
          {/* Center Panel */}
          <div
            class="flex-1 flex flex-col h-full overflow-hidden"
            style={{ background: "var(--color-bg-primary)" }} data-xid="g2VDNHQi">

            {/* Toolbar */}
            <ToolbarPanel data-xid="EJTPKfrt" />

            {/* Main content area */}
            <div
              class="h-full flex flex-col relative overflow-auto custom-scrollbar"
              style={{ height: "calc(100% - 56px)" }} data-xid="Bk1V_N_d">

              <Switch data-xid="RpO5NuJz">
                <Match when={store.viewMode === "library"} data-xid="_2e5lbH1">
                  <LibraryPanel data-xid="UXobIx3C" />
                </Match>
                <Match when={store.viewMode === "editor"} data-xid="9Fx_8_GF">
                  <div class="flex-1 flex flex-col" data-xid="aSsj2GMF">
                    <PreviewPanel data-xid="IDGdbtRj" />
                  </div>
                </Match>
              </Switch>
            </div>
          </div>

          {/* Unified Right Sidebar */}
          <div class="flex" data-xid="3bI0ZixC">
            <RightSidebar data-xid="VTu-HR-E" />

            {/* Unified Sidebar Container - Only animates on open/close */}
            <div
              class="transition-all duration-300 ease-in-out border-l h-full overflow-hidden"
              style={{
                width: store.sidebarShown ? `${store.sidebarWidth}px` : "0px",
                "border-color": "var(--color-border)",
                background: "var(--color-bg-surface-primary)"
              }} data-xid="61SPlCRF">

              <Show when={store.sidebarShown === "properties"} data-xid="XX_aoggE">
                <PropertiesPanel data-xid="2rWxa1HX" />
              </Show>
              <Show when={store.sidebarShown === "assistant"} data-xid="0iSdsT-T">
                <AssistantPanel data-xid="_2L4t-8w" />
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>);

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
      <Switch data-xid="Oy3G19hb">
        <Match when={session().isPending} data-xid="HaQ6qCQ8">
          <div class="loading-overlay" data-xid="AX48APJU">
            <div class="spinner" data-xid="HteJBZ0B" />
          </div>
        </Match>

        <Match when={session()?.data} data-xid="KalLUdQH">
          <Show
            when={projectId()}
            fallback={
            <div class="error-overlay" data-xid="3iIHGin1">
                <div class="error-card" data-xid="cfjfX02d">
                  <h2 data-xid="JGEsZACw">Invalid Project URL</h2>
                  <p data-xid="60puPxlg">
                    Please navigate to a specific project from the{" "}
                    <a href="/" data-xid="5hMZqKWX">project selection page</a>.
                  </p>
                </div>
              </div>
            } data-xid="_spLrqWW">

            <ProjectProvider
              projectId={projectId()!}
              projectName="Sample Project" data-xid="3iIHGin1">

              <ProjectCore user={session()!.data!.user as User} data-xid="cfjfX02d" />
            </ProjectProvider>
          </Show>
        </Match>

        <Match when={!session()?.data && !session().isPending} data-xid="3Z7neO3G">
          {window.location.href = "/"}
          <div data-xid="-DyhxzLF">Redirecting...</div>
        </Match>
      </Switch>
    </>);

}