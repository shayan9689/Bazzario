import { useEffect, useMemo, useState } from "react";
import { Box, LogOut, MapPin, Package, Search, Settings2, User2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { accountOrderHistory, accountStats } from "@/data/storeData";
import { useThemeMode } from "@/context/ThemeContext";
import { useStore } from "@/context/StoreContext";

const sidebarItems = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: User2 },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "signout", label: "Sign Out", icon: LogOut },
];

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState("orders");
  const [orderSearch, setOrderSearch] = useState("");
  const [profileName, setProfileName] = useState("Alex Johnson");
  const [profilePhone, setProfilePhone] = useState("+1 310 555 9988");
  const { theme, toggleTheme } = useThemeMode();
  const { isAuthenticated, user, orders, settings, loadOrders, loadSettings, logout, updateAccountSettings, updateProfile } = useStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
    loadSettings();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || "");
    setProfilePhone(user.phone || "");
  }, [user]);

  const shipmentEnabled = settings?.shipment_updates ?? true;
  const marketingEnabled = settings?.marketing_updates ?? true;
  const baseOrders = orders.length ? orders : accountOrderHistory;

  const filteredOrders = useMemo(
    () =>
      baseOrders.filter((order) => {
        const token = orderSearch.toLowerCase();
        const orderId = (order.order_id || order.id || "").toLowerCase();
        const orderItems = order.items || [];
        return orderId.includes(token) || orderItems.some((item) => item.name.toLowerCase().includes(token));
      }),
    [baseOrders, orderSearch],
  );

  const stats = useMemo(() => {
    if (!orders.length) return accountStats;
    const active = orders.filter((order) => order.status === "pending_payment" || order.status === "shipped").length;
    const delivered = orders.filter((order) => order.status === "confirmed").length;
    return [
      { id: "total-orders", label: "Total Orders", value: String(orders.length) },
      { id: "active-shipments", label: "Active Shipments", value: String(active) },
      { id: "delivered-items", label: "Delivered Items", value: String(delivered) },
      { id: "account-age", label: "Account Age", value: "2 Years" },
    ];
  }, [orders]);

  const handleSignout = () => {
    logout();
    toast.success("Signed out successfully");
  };

  const handleSaveSettings = async () => {
    try {
      await updateAccountSettings({
        theme,
        shipment_updates: shipmentEnabled,
        marketing_updates: marketingEnabled,
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to save settings");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to update profile");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-shell" data-testid="account-page-root">
        <SiteHeader />
        <main className="container-shell py-16" data-testid="account-auth-required-main">
          <article className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center" data-testid="account-auth-required-card">
            <h1 className="text-3xl font-bold" data-testid="account-auth-required-title">Please sign in to access your account</h1>
            <p className="mt-2 text-zinc-500" data-testid="account-auth-required-description">Track orders, manage addresses, and control your settings after login.</p>
            <a href="/signin" data-testid="account-auth-required-link">
              <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700" data-testid="account-auth-required-button">Go to Sign In</Button>
            </a>
          </article>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="app-shell" data-testid="account-page-root">
      <SiteHeader />

      <main className="container-shell py-8 md:py-10" data-testid="account-main-section">
        <div className="grid gap-7 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900" data-testid="account-sidebar">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "signout") {
                        handleSignout();
                        return;
                      }
                      setActiveSection(item.id);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      active ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    data-testid={`account-sidebar-${item.id}-button`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span data-testid={`account-sidebar-${item.id}-label`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section data-testid="account-content-area">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-4xl font-bold tracking-tight" data-testid="account-page-heading">My Account</h1>
                <p className="text-zinc-500" data-testid="account-page-subheading">Manage your orders, profile, and preferences.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-zinc-900 dark:text-zinc-100" onClick={() => setActiveSection("settings")} data-testid="account-settings-shortcut-button">
                  Account Settings
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="account-new-address-button" onClick={() => toast.success("Address modal opened")}>
                  + New Address
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4" data-testid="account-stats-grid">
              {stats.map((stat) => (
                <article key={stat.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900" data-testid={`account-stat-card-${stat.id}`}>
                  <p className="text-xs uppercase tracking-wide text-zinc-500" data-testid={`account-stat-title-${stat.id}`}>{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold" data-testid={`account-stat-value-${stat.id}`}>{stat.value}</p>
                </article>
              ))}
            </div>

            <Tabs value={activeSection} onValueChange={setActiveSection} className="mt-6" data-testid="account-tabs-root">
              <TabsList className="grid h-11 w-full grid-cols-2 sm:grid-cols-4" data-testid="account-tabs-list">
                <TabsTrigger value="orders" data-testid="account-tab-orders">Orders</TabsTrigger>
                <TabsTrigger value="profile" data-testid="account-tab-profile">Profile</TabsTrigger>
                <TabsTrigger value="addresses" data-testid="account-tab-addresses">Addresses</TabsTrigger>
                <TabsTrigger value="settings" data-testid="account-tab-settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4 space-y-4" data-testid="account-orders-content">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative max-w-md flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                        placeholder="Search by order ID or product"
                        className="pl-9"
                        data-testid="account-order-search-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" data-testid="account-order-period-select">
                        <option>Last 3 Months</option>
                        <option>Last 6 Months</option>
                        <option>Last 1 Year</option>
                      </select>
                      <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" data-testid="account-order-status-select">
                        <option>Status: All</option>
                        <option>Delivered</option>
                        <option>Shipped</option>
                      </select>
                    </div>
                  </div>
                </div>

                {filteredOrders.map((order) => {
                  const orderId = order.order_id || order.id;
                  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date;
                  const orderTotal = order.total;
                  const statusLabel = order.status;
                  return (
                  <article key={orderId} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900" data-testid={`account-order-card-${orderId}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-3 sm:gap-7">
                        <p data-testid={`account-order-date-${orderId}`}>
                          <span className="block text-xs uppercase tracking-wide text-zinc-400">Order Placed</span>
                          {orderDate}
                        </p>
                        <p data-testid={`account-order-total-${orderId}`}>
                          <span className="block text-xs uppercase tracking-wide text-zinc-400">Total Amount</span>
                          ${orderTotal.toFixed(2)}
                        </p>
                        <p data-testid={`account-order-recipient-${orderId}`}>
                          <span className="block text-xs uppercase tracking-wide text-zinc-400">Ship To</span>
                          {order.shipping_address?.first_name || order.shipTo || user?.name || "Customer"}
                        </p>
                      </div>
                      <p className="text-sm" data-testid={`account-order-meta-${orderId}`}>
                        Order # {orderId} <span className="ml-1 rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">{statusLabel}</span>
                      </p>
                    </div>

                    <div className="mt-4 space-y-3" data-testid={`account-order-items-${orderId}`}>
                      {(order.items || []).map((item) => (
                        <div key={item.product_id || item.id} className="grid gap-3 md:grid-cols-[74px_1fr_auto] md:items-center" data-testid={`account-order-item-${orderId}-${item.product_id || item.id}`}>
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" data-testid={`account-order-item-image-${orderId}-${item.product_id || item.id}`} />
                          <div>
                            <h3 className="font-semibold" data-testid={`account-order-item-name-${orderId}-${item.product_id || item.id}`}>{item.name}</h3>
                            <p className="text-sm text-zinc-500" data-testid={`account-order-item-qty-${orderId}-${item.product_id || item.id}`}>Qty: {item.quantity}</p>
                          </div>
                          <p className="text-lg font-semibold" data-testid={`account-order-item-price-${orderId}-${item.product_id || item.id}`}>${(item.price || item.unit_price || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2" data-testid={`account-order-actions-${orderId}`}>
                      <Button variant="outline" data-testid={`account-order-invoice-button-${orderId}`} onClick={() => toast.success(`Invoice for ${orderId} downloaded`)}>
                        <Box className="mr-1 h-4 w-4" /> Invoice
                      </Button>
                      <Button variant="outline" data-testid={`account-order-view-details-button-${orderId}`} onClick={() => toast.info(`Details opened for ${orderId}`)}>
                        View Details
                      </Button>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid={`account-order-track-button-${orderId}`} onClick={() => toast.success(`Tracking ${orderId}`)}>
                        Track Package
                      </Button>
                    </div>
                  </article>
                )})}
              </TabsContent>

              <TabsContent value="profile" className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-testid="account-profile-content">
                <h3 className="text-2xl font-bold" data-testid="account-profile-heading">Profile Information</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input value={profileName} onChange={(event) => setProfileName(event.target.value)} data-testid="account-profile-first-name-input" />
                  <Input value={user?.email || ""} readOnly data-testid="account-profile-email-input" />
                  <Input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} data-testid="account-profile-phone-input" />
                  <Input value={user?.id || ""} readOnly data-testid="account-profile-user-id-input" />
                </div>
                <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700" data-testid="account-profile-save-button" onClick={handleSaveProfile}>Save Profile</Button>
              </TabsContent>

              <TabsContent value="addresses" className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-testid="account-addresses-content">
                <h3 className="text-2xl font-bold" data-testid="account-addresses-heading">Saved Addresses</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <article className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700" data-testid="account-address-card-primary">
                    <p className="font-semibold" data-testid="account-address-primary-title">Home</p>
                    <p className="mt-1 text-sm text-zinc-500" data-testid="account-address-primary-text">221B Palm Street, Los Angeles, CA 90001</p>
                  </article>
                  <article className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700" data-testid="account-address-card-office">
                    <p className="font-semibold" data-testid="account-address-office-title">Office</p>
                    <p className="mt-1 text-sm text-zinc-500" data-testid="account-address-office-text">84 Commerce Avenue, Suite 209, Santa Monica</p>
                  </article>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-testid="account-settings-content">
                <h3 className="text-2xl font-bold" data-testid="account-settings-heading">Website Settings</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700" data-testid="account-settings-theme-row">
                    <div>
                      <p className="font-semibold" data-testid="account-settings-theme-title">Dark / Light Theme</p>
                      <p className="text-sm text-zinc-500" data-testid="account-settings-theme-description">Current mode: {theme}</p>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} data-testid="account-settings-theme-switch" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700" data-testid="account-settings-shipment-row">
                    <div>
                      <p className="font-semibold" data-testid="account-settings-shipment-title">Shipment Updates</p>
                      <p className="text-sm text-zinc-500" data-testid="account-settings-shipment-description">Receive order tracking alerts.</p>
                    </div>
                    <Switch checked={shipmentEnabled} onCheckedChange={(value) => updateAccountSettings({ shipment_updates: value })} data-testid="account-settings-shipment-switch" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700" data-testid="account-settings-marketing-row">
                    <div>
                      <p className="font-semibold" data-testid="account-settings-marketing-title">Deals & Marketing</p>
                      <p className="text-sm text-zinc-500" data-testid="account-settings-marketing-description">Receive weekly promos and flash sales.</p>
                    </div>
                    <Switch checked={marketingEnabled} onCheckedChange={(value) => updateAccountSettings({ marketing_updates: value })} data-testid="account-settings-marketing-switch" />
                  </div>

                  <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="account-settings-save-button" onClick={handleSaveSettings}>Save Settings</Button>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
