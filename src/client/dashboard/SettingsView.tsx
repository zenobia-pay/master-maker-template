import { Show, createSignal, createEffect } from "solid-js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useDashboard } from "./DashboardContext";
import type { MerchantSettings } from "@shared/types/merchant";

export default function SettingsView() {
  const { store, actions } = useDashboard();
  
  // Local form state
  const [businessInfo, setBusinessInfo] = createSignal({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    taxId: "",
  });
  
  const [localization, setLocalization] = createSignal({
    currency: "USD",
    timezone: "America/New_York",
  });
  
  const [notifications, setNotifications] = createSignal({
    emailOnNewOrder: false,
    emailOnPayment: false,
    emailOnRefund: false,
  });

  // Initialize form state from store
  createEffect(() => {
    if (store.settings) {
      setBusinessInfo({
        businessName: store.settings.businessName || "",
        businessEmail: store.settings.businessEmail || "",
        businessPhone: store.settings.businessPhone || "",
        taxId: store.settings.taxId || "",
      });
      
      setLocalization({
        currency: store.settings.currency || "USD",
        timezone: store.settings.timezone || "America/New_York",
      });
      
      setNotifications({
        emailOnNewOrder: store.settings.notifications?.emailOnNewOrder || false,
        emailOnPayment: store.settings.notifications?.emailOnPayment || false,
        emailOnRefund: store.settings.notifications?.emailOnRefund || false,
      });
    }
  });

  const handleSaveBusinessInfo = () => {
    console.log("Saving business info:", businessInfo());
    actions.updateSettings(businessInfo());
  };

  const handleSaveLocalization = () => {
    actions.updateSettings(localization());
  };

  const handleSaveNotifications = () => {
    actions.updateSettings({
      notifications: notifications(),
    });
  };

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
                    value={businessInfo().businessName}
                    onInput={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Business Name"
                  />
                </TextField>
              </div>
              <div class="space-y-2">
                <Label for="businessEmail">Business Email</Label>
                <TextField>
                  <TextFieldInput
                    type="email"
                    value={businessInfo().businessEmail}
                    onInput={(e) => setBusinessInfo(prev => ({ ...prev, businessEmail: e.target.value }))}
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
                    value={businessInfo().businessPhone}
                    onInput={(e) => setBusinessInfo(prev => ({ ...prev, businessPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </TextField>
              </div>
              <div class="space-y-2">
                <Label for="taxId">Tax ID</Label>
                <TextField>
                  <TextFieldInput
                    value={businessInfo().taxId}
                    onInput={(e) => setBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="Tax ID Number"
                  />
                </TextField>
              </div>
            </div>
            <Button onClick={handleSaveBusinessInfo} disabled={store.isUpdatingSettings}>
              {store.isUpdatingSettings ? "Saving..." : "Save Business Information"}
            </Button>
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
                <select 
                  value={localization().currency}
                  onChange={(e) => setLocalization(prev => ({ ...prev, currency: e.target.value }))}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="timezone">Timezone</Label>
                <select
                  value={localization().timezone}
                  onChange={(e) => setLocalization(prev => ({ ...prev, timezone: e.target.value }))}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London Time</option>
                </select>
              </div>
            </div>
            <Button onClick={handleSaveLocalization} disabled={store.isUpdatingSettings}>
              {store.isUpdatingSettings ? "Saving..." : "Save Localization Settings"}
            </Button>
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
                  checked={notifications().emailOnNewOrder}
                  onChange={(e) => setNotifications(prev => ({ ...prev, emailOnNewOrder: e.target.checked }))}
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
                  checked={notifications().emailOnPayment}
                  onChange={(e) => setNotifications(prev => ({ ...prev, emailOnPayment: e.target.checked }))}
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
                  checked={notifications().emailOnRefund}
                  onChange={(e) => setNotifications(prev => ({ ...prev, emailOnRefund: e.target.checked }))}
                  class="h-4 w-4"
                />
              </div>
            </div>
            <Button onClick={handleSaveNotifications} disabled={store.isUpdatingSettings}>
              {store.isUpdatingSettings ? "Saving..." : "Save Notification Preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
