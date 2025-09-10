import { For, Show, createSignal } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useDashboard } from "./DashboardContext";
import type { Order } from "@shared/types/merchant";

export default function OrdersView() {
  const { store, actions } = useDashboard();
  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [editingOrder, setEditingOrder] = createSignal<Order | null>(null);

  const [newOrder, setNewOrder] = createSignal({
    customerName: "",
    customerEmail: "",
    amount: 0,
    items: [{ id: crypto.randomUUID(), name: "", quantity: 1, price: 0 }],
  });

  const handleCreateOrder = () => {
    const orderData = newOrder();
    actions.createOrder({
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      amount: orderData.amount * 100, // Convert to cents
      items: orderData.items,
    });
    setNewOrder({
      customerName: "",
      customerEmail: "",
      amount: 0,
      items: [{ id: crypto.randomUUID(), name: "", quantity: 1, price: 0 }],
    });
    setShowCreateForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Orders</h1>
          <p class="text-muted-foreground">
            Manage and track all your orders.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm())}>
          {showCreateForm() ? "Cancel" : "Create Order"}
        </Button>
      </div>

      <Separator />

      <Show when={showCreateForm()}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <TextField>
                <TextFieldLabel>Customer Name</TextFieldLabel>
                <TextFieldInput
                  value={newOrder().customerName}
                  onInput={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="John Doe"
                />
              </TextField>
              <TextField>
                <TextFieldLabel>Customer Email</TextFieldLabel>
                <TextFieldInput
                  type="email"
                  value={newOrder().customerEmail}
                  onInput={(e) => setNewOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="john@example.com"
                />
              </TextField>
            </div>
            <TextField>
              <TextFieldLabel>Total Amount ($)</TextFieldLabel>
              <TextFieldInput
                type="number"
                step="0.01"
                value={newOrder().amount}
                onInput={(e) => setNewOrder(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="99.99"
              />
            </TextField>
            <div class="flex gap-2">
              <Button onClick={handleCreateOrder}>Create Order</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </Show>

      <div class="grid gap-4">
        <Show when={store.orders.length === 0} fallback={
          <For each={store.orders}>
            {(order) => (
              <Card>
                <CardContent class="p-6">
                  <div class="flex justify-between items-start">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <h3 class="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <Badge class={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p class="text-sm text-muted-foreground">
                        Customer: {order.customerName} ({order.customerEmail})
                      </p>
                      <p class="text-sm">
                        Amount: {formatAmount(order.amount)}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        Created: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => actions.updateOrder(order.id, { status: "processing" })}
                      >
                        Mark Processing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </For>
        }>
          <Card>
            <CardContent class="p-6 text-center">
              <p class="text-muted-foreground">No orders yet</p>
              <Button class="mt-2" onClick={() => setShowCreateForm(true)}>
                Create your first order
              </Button>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  );
}