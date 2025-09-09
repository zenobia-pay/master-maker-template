import { Show, For } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Flex } from "~/components/ui/flex";
import { Skeleton } from "~/components/ui/skeleton";
import { useDashboard } from "../../contexts/DashboardContext";

function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
}

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

export default function OverviewView() {
  const { store, actions, derived } = useDashboard();

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Overview</h1>
        <Button onClick={() => actions.setShowCreateOrderDialog(true)}>
          + Create Order
        </Button>
      </div>

      <Show when={store.error}>
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {store.error}
        </div>
      </Show>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              class="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading}
              fallback={<Skeleton class="h-8 w-32" />}
            >
              <div class="text-2xl font-bold">
                {formatCurrency(derived.totalRevenue(), store.settings?.currency)}
              </div>
              <p class="text-xs text-muted-foreground">
                From {derived.orderCount()} orders
              </p>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Orders</CardTitle>
            <svg
              class="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading}
              fallback={<Skeleton class="h-8 w-20" />}
            >
              <div class="text-2xl font-bold">{derived.orderCount()}</div>
              <p class="text-xs text-muted-foreground">
                {derived.pendingOrdersCount()} pending
              </p>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Transactions</CardTitle>
            <svg
              class="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading}
              fallback={<Skeleton class="h-8 w-20" />}
            >
              <div class="text-2xl font-bold">{store.transactions.length}</div>
              <p class="text-xs text-muted-foreground">
                This month
              </p>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Avg Order Value</CardTitle>
            <svg
              class="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading && derived.orderCount() > 0}
              fallback={<Skeleton class="h-8 w-24" />}
            >
              <div class="text-2xl font-bold">
                {formatCurrency(
                  Math.round(derived.totalRevenue() / Math.max(derived.orderCount(), 1)),
                  store.settings?.currency
                )}
              </div>
              <p class="text-xs text-muted-foreground">
                Per order
              </p>
            </Show>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setCurrentView("orders")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading}
              fallback={
                <div class="space-y-3">
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                </div>
              }
            >
              <Show
                when={store.orders.length > 0}
                fallback={
                  <div class="text-center py-6 text-muted-foreground">
                    No orders yet
                  </div>
                }
              >
                <div class="space-y-3">
                  <For each={store.orders.slice(0, 5)}>
                    {(order) => (
                      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p class="font-medium">{order.customerName}</p>
                          <p class="text-sm text-muted-foreground">
                            {formatRelativeTime(new Date(order.createdAt))}
                          </p>
                        </div>
                        <div class="text-right">
                          <p class="font-medium">
                            {formatCurrency(order.amount, order.currency)}
                          </p>
                          <p class="text-sm text-muted-foreground capitalize">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setCurrentView("transactions")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Show
              when={!store.isLoading}
              fallback={
                <div class="space-y-3">
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                </div>
              }
            >
              <Show
                when={derived.recentTransactions().length > 0}
                fallback={
                  <div class="text-center py-6 text-muted-foreground">
                    No transactions yet
                  </div>
                }
              >
                <div class="space-y-3">
                  <For each={derived.recentTransactions()}>
                    {(transaction) => (
                      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p class="font-medium">{transaction.customerName}</p>
                          <p class="text-sm text-muted-foreground">
                            {transaction.type} • {transaction.paymentMethod}
                          </p>
                        </div>
                        <div class="text-right">
                          <p class="font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p class="text-sm text-muted-foreground capitalize">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}