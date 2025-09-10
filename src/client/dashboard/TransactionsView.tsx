import { For, Show, createSignal } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useDashboard } from "./DashboardContext";
import type { Transaction } from "@shared/types/merchant";

export default function TransactionsView() {
  const { store } = useDashboard();
  const [filter, setFilter] = createSignal<string>("all");
  const [typeFilter, setTypeFilter] = createSignal<string>("all");

  const filteredTransactions = () => {
    let filtered = store.transactions;
    
    if (filter() !== "all") {
      filtered = filtered.filter(t => t.status === filter());
    }
    
    if (typeFilter() !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter());
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment": return "bg-blue-100 text-blue-800";
      case "refund": return "bg-orange-100 text-orange-800";
      case "chargeback": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Transactions</h1>
        <p class="text-muted-foreground">
          View and manage all payment transactions.
        </p>
      </div>

      <Separator />

      <div class="flex gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Status:</label>
          <Select value={filter()} onValueChange={setFilter}>
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Type:</label>
          <Select value={typeFilter()} onValueChange={setTypeFilter}>
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="chargeback">Chargeback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="ml-auto text-sm text-muted-foreground">
          {filteredTransactions().length} transactions
        </div>
      </div>

      <div class="grid gap-4">
        <Show when={filteredTransactions().length === 0} fallback={
          <For each={filteredTransactions()}>
            {(transaction) => (
              <Card>
                <CardContent class="p-6">
                  <div class="flex justify-between items-start">
                    <div class="space-y-2 flex-1">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold">Transaction #{transaction.id.slice(-8)}</h3>
                        <Badge class={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <Badge class={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p class="text-muted-foreground">Customer</p>
                          <p>{transaction.customerName}</p>
                          <p class="text-xs text-muted-foreground">{transaction.customerEmail}</p>
                        </div>
                        <div>
                          <p class="text-muted-foreground">Amount</p>
                          <p class="font-semibold text-lg">{formatAmount(transaction.amount)}</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-3 gap-4 text-sm">
                        <Show when={transaction.paymentMethod}>
                          <div>
                            <p class="text-muted-foreground">Payment Method</p>
                            <p class="capitalize">{transaction.paymentMethod}</p>
                          </div>
                        </Show>
                        <Show when={transaction.paymentProcessor}>
                          <div>
                            <p class="text-muted-foreground">Processor</p>
                            <p class="capitalize">{transaction.paymentProcessor}</p>
                          </div>
                        </Show>
                        <div>
                          <p class="text-muted-foreground">Date</p>
                          <p>{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>

                      <Show when={transaction.description}>
                        <div class="text-sm">
                          <p class="text-muted-foreground">Description</p>
                          <p>{transaction.description}</p>
                        </div>
                      </Show>

                      <Show when={transaction.orderId}>
                        <div class="text-sm">
                          <p class="text-muted-foreground">Related Order</p>
                          <p class="text-blue-600 hover:underline cursor-pointer">
                            Order #{transaction.orderId?.slice(-8)}
                          </p>
                        </div>
                      </Show>
                    </div>
                    
                    <div class="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Show when={transaction.status === "pending" && transaction.type === "payment"}>
                        <Button variant="outline" size="sm">
                          Process Refund
                        </Button>
                      </Show>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        }>
          <Card>
            <CardContent class="p-6 text-center">
              <p class="text-muted-foreground">No transactions found</p>
              <p class="text-sm text-muted-foreground mt-1">
                Transactions will appear here when orders are processed
              </p>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  );
}