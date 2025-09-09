import {
  createSignal,
  createResource,
  For,
  Show,
  createEffect,
} from "solid-js";
import { createAuthClient } from "better-auth/solid";
import { apiClient } from "../utils/api/client";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Flex } from "~/components/ui/flex";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { Skeleton } from "~/components/ui/skeleton";

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

export default function Dashboard() {
  const [isCreating, setIsCreating] = createSignal(false);
  const [error, setError] = createSignal("");
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = createSignal(false);
  const [newProjectName, setNewProjectName] = createSignal("");

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

  const onClickCreate = () => {
    setNewProjectName("Untitled Project");
    setShowCreateDialog(true);
  };

  const handleCreateProject = async () => {
    await createProject(newProjectName());
    setShowCreateDialog(false);
    setNewProjectName("");
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

  // Redirect to login if not authenticated
  createEffect(() => {
    console.log("Session data", session()?.data?.user);
    if (!session().isPending && session().data == null) {
      window.location.href = "/login/";
    }
  });

  return (
    <div class="min-h-screen font-manrope">
      <SidebarProvider defaultOpen={true}>
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
          <SidebarHeader>
            <Show
              when={session() && !session().isPending}
              fallback={
                <Flex alignItems="center" class="gap-2">
                  <Skeleton class="w-6 h-6 rounded" />
                  <Skeleton class="h-4 w-20" />
                </Flex>
              }
            >
              <Flex alignItems="center" class="gap-2">
                <div class="w-6 h-6 rounded bg-primary" />
                <span class="font-semibold">Dashboard</span>
              </Flex>
            </Show>
          </SidebarHeader>

          <SidebarContent class="p-3 space-y-2">
            <Show
              when={session() && !session().isPending}
              fallback={
                <>
                  <Skeleton class="h-9 w-full" />
                  <Skeleton class="h-9 w-full" />
                </>
              }
            >
              <Button variant="secondary" class="w-full justify-start">
                Projects
              </Button>
              <Show when={isAdmin()}>
                <a href="/admin" class="w-full">
                  <Button
                    variant="outline"
                    class="w-full justify-start text-primary"
                  >
                    Admin Dashboard
                  </Button>
                </a>
              </Show>
            </Show>
          </SidebarContent>

          <SidebarFooter>
            <Show
              when={session() && !session().isPending}
              fallback={<Skeleton class="h-6 w-16" />}
            >
              <Button
                variant="ghost"
                class="text-xs text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                Sign out
              </Button>
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
                <span class="text-sm text-muted-foreground">Dashboard</span>
                <span class="text-sm text-muted-foreground">/</span>
                <h1 class="text-sm font-semibold">Projects</h1>
              </Flex>
            </Show>
          </header>

          <div class="p-6 space-y-3">
            <Show when={error()}>
              <div class="text-sm text-red-500">{error()}</div>
            </Show>

            <Show
              when={session() && !session().isPending}
              fallback={
                <>
                  <Skeleton class="h-8 w-48 mb-4" />
                  <Skeleton class="h-64 w-full" />
                </>
              }
            >
              <Flex justifyContent="between" alignItems="center" class="mb-4">
                <h2 class="text-lg font-semibold">All Projects</h2>
                <Button onClick={onClickCreate} disabled={isCreating()}>
                  + Create Project
                </Button>
              </Flex>

              <Show
                when={!projects.loading}
                fallback={
                  <Flex
                    class="py-8"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div class="animate-spin rounded-full border-b-2 border-primary h-8 w-8" />
                    <span class="ml-2 text-muted-foreground">
                      Loading projects...
                    </span>
                  </Flex>
                }
              >
                <Show
                  when={projects()?.projects && projects()!.projects.length > 0}
                  fallback={
                    <Card class="py-16 px-8">
                      <CardContent>
                        <Flex
                          flexDirection="col"
                          alignItems="center"
                          justifyContent="center"
                          class="space-y-6"
                        >
                          <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <svg
                              class="w-10 h-10 text-primary"
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
                          <div class="text-center space-y-2">
                            <h2 class="text-2xl font-bold">No projects yet</h2>
                            <p class="text-muted-foreground max-w-md">
                              Get started by creating your first project.
                            </p>
                          </div>
                          <Button
                            onClick={onClickCreate}
                            disabled={isCreating()}
                            size="lg"
                          >
                            Create your first project
                          </Button>
                        </Flex>
                      </CardContent>
                    </Card>
                  }
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead class="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <For each={projects()?.projects}>
                        {(project, index) => (
                          <TableRow>
                            <TableCell class="text-muted-foreground">
                              {index() + 1}
                            </TableCell>
                            <TableCell>
                              <a
                                href={`/project/?id=${project.id}`}
                                class="hover:underline font-medium"
                              >
                                {project.name}
                              </a>
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                              {formatRelativeTime(new Date(project.createdAt))}
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                              {formatRelativeTime(new Date(project.updatedAt))}
                            </TableCell>
                            <TableCell class="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                class="text-destructive hover:text-destructive/80"
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
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </For>
                    </TableBody>
                  </Table>
                </Show>
              </Show>
            </Show>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={showCreateDialog()} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project.
            </DialogDescription>
          </DialogHeader>
          <div class="space-y-4">
            <TextField>
              <TextFieldLabel>Project Name</TextFieldLabel>
              <TextFieldInput
                value={newProjectName()}
                onInput={(e) => setNewProjectName(e.currentTarget.value)}
                placeholder="Enter project name"
              />
            </TextField>
            <div class="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={isCreating() || !newProjectName().trim()}
              >
                {isCreating() ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
