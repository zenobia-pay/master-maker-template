import {
  createContext,
  useContext,
  type ParentComponent,
  createMemo,
  onCleanup,
  createSignal,
  createEffect,
  on,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { AutosaveService } from "../services/AutosaveService";
import type { DashboardEvent } from "@shared/types/events";
import type { Order, Transaction, MerchantSettings, DashboardStats, MerchantUser, DashboardView } from "@shared/types/merchant";
import type { LoadDashboardResponse } from "@shared/types/request-response-schemas";
import { processDashboardEventQueue } from "../editor/dashboardEventProcessor";
import { apiClient } from "../utils/api/client";

export interface DashboardStore {
  // Merchant data
  user: MerchantUser | null;
  orders: Order[];
  transactions: Transaction[];
  settings: MerchantSettings | null;
  stats: DashboardStats | null;
  
  // Current view and routing
  currentView: DashboardView;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Order management state
  isCreatingOrder: boolean;
  isUpdatingOrder: boolean;
  deletingOrderId: string | null;
  showCreateOrderDialog: boolean;
  showEditOrderDialog: boolean;
  editingOrder: Order | null;
  
  // Settings state
  isUpdatingSettings: boolean;
}

// Context type
interface DashboardContextValue {
  store: DashboardStore;
  setStore: SetStoreFunction<DashboardStore>;
  actions: {
    // Navigation
    setCurrentView: (view: DashboardView) => void;
    
    // Order actions
    createOrder: (orderData: Partial<Order>) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    deleteOrder: (orderId: string) => void;
    setShowCreateOrderDialog: (show: boolean) => void;
    setShowEditOrderDialog: (show: boolean, order?: Order) => void;
    
    // Settings actions
    updateSettings: (updates: Partial<MerchantSettings>) => void;
    
    // General actions
    setError: (error: string | null) => void;
    refetch: () => Promise<void>;
  };
  derived: {
    orderCount: () => number;
    totalRevenue: () => number;
    pendingOrdersCount: () => number;
    recentTransactions: () => Transaction[];
  };
  emitEvent: (event: DashboardEvent) => void;
}

const DashboardContext = createContext<DashboardContextValue>();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

function getViewFromURL(): DashboardView {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') as DashboardView;
  return ['overview', 'orders', 'transactions', 'settings'].includes(view) ? view : 'overview';
}

function updateURL(view: DashboardView) {
  const params = new URLSearchParams(window.location.search);
  params.set('view', view);
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

interface DashboardProviderProps {
  children?: any;
  initialData?: LoadDashboardResponse;
}

export const DashboardProvider: ParentComponent<DashboardProviderProps> = (props) => {
  // Event queue for batching dashboard events
  const [eventQueue, setEventQueue] = createSignal<DashboardEvent[]>([]);

  // Initialize autosave service for dashboard
  const autosaveService = new AutosaveService("dashboard");

  // Initialize store with default values or initialData
  const [store, setStore] = createStore<DashboardStore>({
    // Merchant data
    user: null,
    orders: props.initialData?.orders || [],
    transactions: props.initialData?.transactions || [],
    settings: props.initialData?.settings || null,
    stats: props.initialData?.stats || null,
    
    // Current view from URL
    currentView: getViewFromURL(),
    
    // UI state
    isLoading: !props.initialData,
    error: null,
    
    // Order management state
    isCreatingOrder: false,
    isUpdatingOrder: false,
    deletingOrderId: null,
    showCreateOrderDialog: false,
    showEditOrderDialog: false,
    editingOrder: null,
    
    // Settings state
    isUpdatingSettings: false,
  });

  // Derived values
  const orderCount = createMemo(() => {
    return store.orders.length;
  });

  const totalRevenue = createMemo(() => {
    return store.orders.reduce((total, order) => {
      if (order.status === 'delivered') {
        return total + order.amount;
      }
      return total;
    }, 0);
  });

  const pendingOrdersCount = createMemo(() => {
    return store.orders.filter(order => order.status === 'pending').length;
  });

  const recentTransactions = createMemo(() => {
    return store.transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  });

  // Actions
  const actions = {
    // Navigation
    setCurrentView: (view: DashboardView) => {
      setStore("currentView", view);
      updateURL(view);
    },
    
    // Order actions
    createOrder: (orderData: Partial<Order>) => {
      if (!store.user) return;
      
      setStore("isCreatingOrder", true);
      setStore("error", null);
      
      const newOrder: Order = {
        id: crypto.randomUUID(),
        merchantId: store.user.merchantId,
        customerName: orderData.customerName || "",
        customerEmail: orderData.customerEmail || "",
        amount: orderData.amount || 0,
        currency: orderData.currency || store.settings?.currency || "USD",
        status: "pending",
        items: orderData.items || [],
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      emitEvent({
        type: "ORDER_CREATED",
        merchantId: store.user.merchantId,
        order: newOrder,
      });
    },

    updateOrder: (orderId: string, updates: Partial<Order>) => {
      const order = store.orders.find(o => o.id === orderId);
      if (!order || !store.user) return;
      
      setStore("isUpdatingOrder", true);
      
      emitEvent({
        type: "ORDER_UPDATED",
        orderId,
        merchantId: store.user.merchantId,
        previousValues: { ...order },
        newValues: { ...updates, updatedAt: new Date() },
      });
    },

    deleteOrder: (orderId: string) => {
      const order = store.orders.find(o => o.id === orderId);
      if (!order || !store.user) return;
      
      setStore("deletingOrderId", orderId);
      
      emitEvent({
        type: "ORDER_DELETED",
        orderId,
        merchantId: store.user.merchantId,
        previousOrder: order,
      });
    },

    setShowCreateOrderDialog: (show: boolean) => {
      setStore("showCreateOrderDialog", show);
    },

    setShowEditOrderDialog: (show: boolean, order?: Order) => {
      setStore("showEditOrderDialog", show);
      setStore("editingOrder", order || null);
    },
    
    // Settings actions
    updateSettings: (updates: Partial<MerchantSettings>) => {
      if (!store.user || !store.settings) return;
      
      setStore("isUpdatingSettings", true);
      
      Object.entries(updates).forEach(([key, value]) => {
        emitEvent({
          type: "MERCHANT_SETTINGS_UPDATED",
          merchantId: store.user!.merchantId,
          propertyKey: key,
          previousValue: (store.settings as any)?.[key],
          newValue: value,
        });
      });
    },

    setError: (error: string | null) => {
      setStore("error", error);
    },

    refetch: async () => {
      try {
        setStore("isLoading", true);
        const dashboardData = await apiClient.loadDashboard();
        setStore("user", dashboardData.user);
        setStore("orders", dashboardData.orders);
        setStore("transactions", dashboardData.transactions);
        setStore("settings", dashboardData.settings);
        setStore("stats", dashboardData.stats);
        setStore("error", null);
      } catch (error) {
        console.error("Failed to refetch dashboard data:", error);
        setStore("error", "Failed to load dashboard data");
      } finally {
        setStore("isLoading", false);
      }
    },
  };

  const emitEvent = (event: DashboardEvent) => {
    setEventQueue((prev) => [...prev, event]);
  };

  // Load dashboard data on mount
  createEffect(async () => {
    try {
      setStore("isLoading", true);
      const dashboardData = await apiClient.loadDashboard();
      setStore("user", dashboardData.user);
      setStore("orders", dashboardData.orders);
      setStore("transactions", dashboardData.transactions);
      setStore("settings", dashboardData.settings);
      setStore("stats", dashboardData.stats);
      setStore("error", null);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStore("error", "Failed to load dashboard data");
    } finally {
      setStore("isLoading", false);
    }
  });

  // Listen for browser back/forward navigation
  createEffect(() => {
    const handlePopState = () => {
      setStore("currentView", getViewFromURL());
    };
    
    window.addEventListener('popstate', handlePopState);
    onCleanup(() => window.removeEventListener('popstate', handlePopState));
  });

  // Single effect to handle all events and update dashboard
  createEffect(
    on(eventQueue, (events) => {
      if (events.length === 0) return;

      // Process events using dashboard processor (updates client-side store immediately)
      processDashboardEventQueue(events, store, setStore);

      // Queue events for autosave (separate from immediate client updates)
      autosaveService.queueMultipleForSave(events);

      // Clear event queue
      setEventQueue([]);
    })
  );

  // Cleanup
  onCleanup(() => {
    autosaveService.destroy();
  });

  const value: DashboardContextValue = {
    store,
    setStore,
    actions,
    derived: {
      orderCount,
      totalRevenue,
      pendingOrdersCount,
      recentTransactions,
    },
    emitEvent,
  };

  return (
    <DashboardContext.Provider value={value}>
      {props.children}
    </DashboardContext.Provider>
  );
};