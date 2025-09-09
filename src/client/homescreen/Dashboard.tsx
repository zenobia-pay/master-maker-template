import {
  For,
  Show,
  Switch,
  Match,
  createEffect,
  createResource,
} from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { DashboardProvider, useDashboard } from "../contexts/DashboardContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { Flex } from "~/components/ui/flex";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import OverviewView from "./views/OverviewView";
import SettingsView from "./views/SettingsView";
import { apiClient } from "../utils/api/client";

const authClient = createAuthClient({
  baseURL: window.location.origin,
});

function DashboardContent() {
  const dashboard = useDashboard();
  const { store, actions } = dashboard;

  // Check if current user has admin role
  const session = authClient.useSession();

  const isAdmin = () => {
    const userData = session()?.data?.user;
    // Check if user has admin role (from email whitelist)
    const userWithRole = userData as { role?: string } | undefined;
    return userData && userWithRole?.role === "admin";
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

  // Redirect to login if not authenticated
  createEffect(() => {
    if (session() && !session().isPending && !session().data?.user) {
      window.location.href = "/login/";
    }
  });

  const sidebarItems = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "transactions", label: "Transactions" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <div class="min-h-screen font-manrope">
      <SidebarProvider defaultOpen={true}>
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
          <SidebarHeader class="border-b p-4">
            <Show
              when={session() && !session().isPending}
              fallback={
                <Flex alignItems="center" class="gap-3">
                  <Skeleton class="w-8 h-8 rounded" />
                  <Skeleton class="h-5 w-24" />
                </Flex>
              }
            >
              <Flex alignItems="center" class="gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div class="w-4 h-4 rounded bg-primary" />
                </div>
                <div>
                  <h2 class="text-lg font-semibold">
                    {store.settings?.businessName || "Dashboard"}
                  </h2>
                  <p class="text-xs text-muted-foreground">Merchant Portal</p>
                </div>
              </Flex>
            </Show>
          </SidebarHeader>

          <SidebarContent class="flex-1 p-2">
            <SidebarMenu>
              <Show
                when={session() && !session().isPending}
                fallback={
                  <>
                    <Skeleton class="h-8 w-full mx-2 mb-1" />
                    <Skeleton class="h-8 w-full mx-2 mb-1" />
                    <Skeleton class="h-8 w-full mx-2 mb-1" />
                    <Skeleton class="h-8 w-full mx-2 mb-1" />
                  </>
                }
              >
                <For each={sidebarItems}>
                  {(item) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={store.currentView === item.id}
                        onClick={() => actions.setCurrentView(item.id)}
                        class="w-full"
                      >
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>
              </Show>
            </SidebarMenu>

            <Show when={isAdmin()}>
              <Separator class="my-4" />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => (window.location.href = "/admin")}
                    class="w-full"
                  >
                    Admin Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </Show>
          </SidebarContent>

          <SidebarFooter class="border-t p-4">
            <Show
              when={session() && !session().isPending}
              fallback={
                <Flex alignItems="center" class="gap-3">
                  <Skeleton class="w-8 h-8 rounded-full" />
                  <div class="space-y-1">
                    <Skeleton class="h-3 w-20" />
                    <Skeleton class="h-3 w-16" />
                  </div>
                </Flex>
              }
            >
              <Flex alignItems="center" class="gap-3">
                <Avatar class="w-8 h-8">
                  <AvatarFallback class="text-xs">
                    {session()?.data?.user?.name?.[0]?.toUpperCase() ||
                      session()?.data?.user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {session()?.data?.user?.name || "User"}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {session()?.data?.user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </Button>
              </Flex>
            </Show>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 h-4" />
            <Show
              when={session() && !session().isPending}
              fallback={
                <Flex alignItems="center" class="gap-2">
                  <Skeleton class="h-4 w-16" />
                  <span class="text-sm text-muted-foreground">/</span>
                  <Skeleton class="h-4 w-12" />
                </Flex>
              }
            >
              <Flex alignItems="center" class="gap-2">
                <span class="text-sm text-muted-foreground">Merchant</span>
                <span class="text-sm text-muted-foreground">/</span>
                <h1 class="text-sm font-semibold capitalize">
                  {store.currentView}
                </h1>
              </Flex>
            </Show>
          </header>

          <div class="p-6">
            <Show
              when={!store.isLoading}
              fallback={
                <div class="space-y-4">
                  <Skeleton class="h-8 w-48" />
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton class="h-32 w-full" />
                    <Skeleton class="h-32 w-full" />
                    <Skeleton class="h-32 w-full" />
                    <Skeleton class="h-32 w-full" />
                  </div>
                  <Skeleton class="h-64 w-full" />
                </div>
              }
            >
              <Switch fallback={<OverviewView />}>
                <Match when={store.currentView === "overview"}>
                  <OverviewView />
                </Match>
                <Match when={store.currentView === "orders"}>
                  <div>Orders view - Coming soon</div>
                </Match>
                <Match when={store.currentView === "transactions"}>
                  <div>Transactions view - Coming soon</div>
                </Match>
                <Match when={store.currentView === "settings"}>
                  <SettingsView />
                </Match>
              </Switch>
            </Show>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function Dashboard() {
  // Load dashboard data using createResource
  const [dashboardData] = createResource(async () => {
    try {
      const dashboardData = await apiClient.loadDashboard();
      console.log("Dashboard data:", dashboardData);
      return dashboardData;
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      throw error;
    }
  });

  return (
    <DashboardProvider initialData={dashboardData()}>
      <DashboardContent />
    </DashboardProvider>
  );
}
