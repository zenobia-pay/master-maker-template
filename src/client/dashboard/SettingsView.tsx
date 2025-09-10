import { Show } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useDashboard } from "./DashboardContext";

export default function SettingsView() {
  const { store, actions } = useDashboard();

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Settings</h1>
        <p class="text-muted-foreground">
          Manage your business settings and preferences.
        </p>
      </div>

      <Separator />

      <div class="grid gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="businessName">Business Name</Label>
                <TextField>
                  <TextFieldInput
                    value={store.settings?.businessName || ""}
                    placeholder="Your Business Name"
                  />
                </TextField>
              </div>
              <div class="space-y-2">
                <Label for="businessEmail">Business Email</Label>
                <TextField>
                  <TextFieldInput
                    type="email"
                    value={store.settings?.businessEmail || ""}
                    placeholder="business@example.com"
                  />
                </TextField>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="businessPhone">Business Phone</Label>
                <TextField>
                  <TextFieldInput
                    value={store.settings?.businessPhone || ""}
                    placeholder="+1 (555) 123-4567"
                  />
                </TextField>
              </div>
              <div class="space-y-2">
                <Label for="taxId">Tax ID</Label>
                <TextField>
                  <TextFieldInput
                    value={store.settings?.taxId || ""}
                    placeholder="Tax ID Number"
                  />
                </TextField>
              </div>
            </div>
            <Button>Save Business Information</Button>
          </CardContent>
        </Card>

        {/* Currency & Localization */}
        <Card>
          <CardHeader>
            <CardTitle>Currency & Localization</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="currency">Default Currency</Label>
                <select class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option
                    value="USD"
                    selected={store.settings?.currency === "USD"}
                  >
                    USD - US Dollar
                  </option>
                  <option
                    value="EUR"
                    selected={store.settings?.currency === "EUR"}
                  >
                    EUR - Euro
                  </option>
                  <option
                    value="GBP"
                    selected={store.settings?.currency === "GBP"}
                  >
                    GBP - British Pound
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="timezone">Timezone</Label>
                <select class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option
                    value="America/New_York"
                    selected={store.settings?.timezone === "America/New_York"}
                  >
                    Eastern Time
                  </option>
                  <option
                    value="America/Los_Angeles"
                    selected={
                      store.settings?.timezone === "America/Los_Angeles"
                    }
                  >
                    Pacific Time
                  </option>
                  <option
                    value="Europe/London"
                    selected={store.settings?.timezone === "Europe/London"}
                  >
                    London Time
                  </option>
                </select>
              </div>
            </div>
            <Button>Save Localization Settings</Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label>Email on New Order</Label>
                  <p class="text-sm text-muted-foreground">
                    Get notified when you receive a new order
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={store.settings?.notifications?.emailOnNewOrder}
                  class="h-4 w-4"
                />
              </div>
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label>Email on Payment</Label>
                  <p class="text-sm text-muted-foreground">
                    Get notified when a payment is received
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={store.settings?.notifications?.emailOnPayment}
                  class="h-4 w-4"
                />
              </div>
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label>Email on Refund</Label>
                  <p class="text-sm text-muted-foreground">
                    Get notified when a refund is processed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={store.settings?.notifications?.emailOnRefund}
                  class="h-4 w-4"
                />
              </div>
            </div>
            <Button>Save Notification Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
