import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getStoredToken, setStoredToken } from "@/lib/api";
import { products as fallbackProducts } from "@/data/storeData";

const StoreContext = createContext(undefined);

export function StoreProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(fallbackProducts);
  const [cart, setCart] = useState({ items: [], item_count: 0, subtotal: 0, tax: 0, total: 0 });
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ theme: "light", shipment_updates: true, marketing_updates: true });

  const isAuthenticated = Boolean(token);

  const loadProducts = async () => {
    try {
      const response = await api.get("/products", { params: { page: 1, page_size: 100 } });
      setProducts(response.data.items || fallbackProducts);
    } catch (error) {
      setProducts(fallbackProducts);
    }
  };

  const loadMe = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      setUser(null);
      setToken("");
      setStoredToken("");
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], item_count: 0, subtotal: 0, tax: 0, total: 0 });
      return;
    }

    try {
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      setCart({ items: [], item_count: 0, subtotal: 0, tax: 0, total: 0 });
    }
  };

  const loadOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return [];
    }
    try {
      const response = await api.get("/orders");
      setOrders(response.data.orders || []);
      return response.data.orders || [];
    } catch (error) {
      setOrders([]);
      return [];
    }
  };

  const loadSettings = async () => {
    if (!isAuthenticated) {
      return settings;
    }
    try {
      const response = await api.get("/account/settings");
      setSettings(response.data);
      return response.data;
    } catch (error) {
      return settings;
    }
  };

  const signIn = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    setStoredToken(response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  };

  const signUp = async (name, email, password) => {
    const response = await api.post("/auth/signup", { name, email, password });
    setStoredToken(response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    setStoredToken("");
    setToken("");
    setUser(null);
    setOrders([]);
    setCart({ items: [], item_count: 0, subtotal: 0, tax: 0, total: 0 });
  };

  const addToCart = async ({ productId, quantity = 1, size = "US 9", color = "Default" }) => {
    const response = await api.post("/cart/items", {
      product_id: productId,
      quantity,
      size,
      color,
    });
    setCart(response.data);
    return response.data;
  };

  const updateCartQuantity = async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    setCart(response.data);
    return response.data;
  };

  const removeCartItem = async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    setCart(response.data);
    return response.data;
  };

  const createOrder = async ({ shippingAddress, paymentMethod, shippingMethod = "standard" }) => {
    const response = await api.post("/orders/checkout", {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      shipping_method: shippingMethod,
    });
    await loadOrders();
    return response.data;
  };

  const fetchOrderPreview = async (shippingMethod = "standard") => {
    const response = await api.get("/orders/preview", { params: { shipping_method: shippingMethod } });
    return response.data;
  };

  const createStripeCheckoutSession = async (orderId) => {
    const response = await api.post("/payments/checkout/session", {
      order_id: orderId,
      origin_url: window.location.origin,
    });
    return response.data;
  };

  const checkStripeCheckoutStatus = async (sessionId) => {
    const response = await api.get(`/payments/checkout/status/${sessionId}`);
    await loadOrders();
    await loadCart();
    return response.data;
  };

  const updateAccountSettings = async (payload) => {
    const response = await api.put("/account/settings", payload);
    setSettings(response.data);
    return response.data;
  };

  const updateProfile = async (payload) => {
    const response = await api.put("/account/profile", payload);
    setUser(response.data);
    return response.data;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!token) return;
    loadMe();
    loadCart();
    loadOrders();
    loadSettings();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      products,
      cart,
      orders,
      settings,
      isAuthenticated,
      loadProducts,
      loadCart,
      loadOrders,
      loadSettings,
      signIn,
      signUp,
      logout,
      addToCart,
      updateCartQuantity,
      removeCartItem,
      createOrder,
      fetchOrderPreview,
      createStripeCheckoutSession,
      checkStripeCheckoutStatus,
      updateAccountSettings,
      updateProfile,
    }),
    [token, user, products, cart, orders, settings, isAuthenticated],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
