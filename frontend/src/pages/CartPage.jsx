import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import TrustBar from "@/components/layout/TrustBar";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/storeData";
import { useStore } from "@/context/StoreContext";

const shippingInfoBlocks = [
  { id: "shipping", title: "Estimate Shipping", text: "Country and zip based estimate", icon: Truck },
  { id: "confidence", title: "Shop with Confidence", text: "30-day returns and secure checkout.", icon: ShieldCheck },
  { id: "returns", title: "Easy Returns", text: "Quick refund process within 7 days.", icon: Undo2 },
];

export default function CartPage() {
  const { cart, isAuthenticated, updateCartQuantity, removeCartItem } = useStore();
  const detailedCart = useMemo(() => cart?.items || [], [cart]);

  const updateQuantity = async (itemId, nextQty) => {
    await updateCartQuantity(itemId, nextQty);
  };

  const removeItem = async (itemId) => {
    await removeCartItem(itemId);
    toast.success("Item removed from cart");
  };

  return (
    <div className="app-shell" data-testid="cart-page-root">
      <SiteHeader cartCount={cart?.item_count || 0} />

      <main>
        <section className="container-shell py-8 md:py-12" data-testid="cart-main-section">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight" data-testid="cart-page-title">
                Shopping Cart
              </h1>
              <p className="text-zinc-500" data-testid="cart-page-subtitle">
                You have {cart?.item_count || 0} items in your cart
              </p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-blue-600" data-testid="cart-continue-shopping-link">
              Continue Shopping
            </Link>
          </div>

          {!isAuthenticated && (
            <article className="mb-6 rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center" data-testid="cart-auth-required-card">
              <h2 className="text-2xl font-bold" data-testid="cart-auth-required-title">Sign in to view your cart</h2>
              <p className="mt-2 text-zinc-500" data-testid="cart-auth-required-description">Your cart syncs securely across devices after sign in.</p>
              <Link to="/signin" data-testid="cart-auth-required-signin-link">
                <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700" data-testid="cart-auth-required-signin-button">Go to Sign In</Button>
              </Link>
            </article>
          )}

          {isAuthenticated && (
            <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4" data-testid="cart-items-list">
              {detailedCart.map((item) => (
                <motion.article
                  key={item.item_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                  data-testid={`cart-item-row-${item.item_id}`}
                >
                  <div className="grid gap-4 md:grid-cols-[130px_1fr_auto] md:items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-full rounded-xl object-cover"
                      data-testid={`cart-item-image-${item.item_id}`}
                    />
                    <div>
                      <h2 className="text-xl font-bold" data-testid={`cart-item-name-${item.item_id}`}>
                        {item.name}
                      </h2>
                      <p className="text-sm text-zinc-500" data-testid={`cart-item-meta-${item.item_id}`}>
                        {item.color} | {item.size}
                      </p>
                      <p className="mt-1 text-sm text-emerald-600" data-testid={`cart-item-stock-${item.item_id}`}>
                        In stock
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2" data-testid={`cart-item-actions-${item.item_id}`}>
                        <div className="flex items-center rounded-full border border-zinc-200" data-testid={`cart-item-quantity-control-${item.item_id}`}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                            className="p-2"
                            data-testid={`cart-item-decrease-button-${item.item_id}`}
                            aria-label="decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-sm font-semibold" data-testid={`cart-item-quantity-value-${item.item_id}`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                            className="p-2"
                            data-testid={`cart-item-increase-button-${item.item_id}`}
                            aria-label="increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-zinc-500 hover:text-zinc-800"
                          onClick={() => removeItem(item.item_id)}
                          data-testid={`cart-item-remove-button-${item.item_id}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" data-testid={`cart-item-price-${item.item_id}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-zinc-400 line-through" data-testid={`cart-item-old-price-${item.item_id}`}>
                        ${(item.old_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}

              <div className="grid gap-4 md:grid-cols-3" data-testid="cart-info-blocks-grid">
                {shippingInfoBlocks.map((block) => (
                  <article key={block.id} className="rounded-2xl border border-zinc-200 bg-white p-4" data-testid={`cart-info-block-${block.id}`}>
                    <block.icon className="h-5 w-5 text-blue-600" />
                    <h3 className="mt-3 font-bold" data-testid={`cart-info-block-title-${block.id}`}>
                      {block.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600" data-testid={`cart-info-block-text-${block.id}`}>
                      {block.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5" data-testid="cart-order-summary-panel">
              <h2 className="text-2xl font-bold" data-testid="cart-order-summary-title">
                Order Summary
              </h2>

              <div className="mt-4 space-y-2 border-b border-zinc-200 pb-4 text-sm">
                <p className="flex justify-between" data-testid="cart-summary-subtotal">
                  <span>Subtotal</span> <span>${(cart?.subtotal || 0).toFixed(2)}</span>
                </p>
                <p className="flex justify-between" data-testid="cart-summary-shipping">
                  <span>Shipping (Standard)</span> <span>FREE</span>
                </p>
                <p className="flex justify-between" data-testid="cart-summary-tax">
                  <span>Estimated Tax</span> <span>${(cart?.tax || 0).toFixed(2)}</span>
                </p>
              </div>

              <div className="mt-4" data-testid="cart-summary-promo-row">
                <label className="text-sm text-zinc-500" data-testid="cart-promo-label">
                  Promo Code
                </label>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Enter code" data-testid="cart-promo-input" />
                  <Button variant="outline" data-testid="cart-promo-apply-button" onClick={() => toast.success("Promo code applied") }>
                    Apply
                  </Button>
                </div>
              </div>

              <p className="mt-6 flex items-center justify-between text-2xl font-bold" data-testid="cart-total-value">
                <span>Total</span>
                <span className="text-blue-600">${(cart?.total || 0).toFixed(2)}</span>
              </p>

              <Link to="/checkout" data-testid="cart-checkout-link">
                <Button
                  className="mt-4 h-12 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  data-testid="cart-checkout-button"
                  onClick={() => toast.success("Proceeding to checkout") }
                  disabled={(cart?.item_count || 0) === 0}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              {(cart?.item_count || 0) === 0 && (
                <p className="mt-2 text-center text-xs text-amber-600" data-testid="cart-empty-warning-text">Add products to continue checkout</p>
              )}
              <p className="mt-3 text-center text-xs text-zinc-500" data-testid="cart-secure-note">
                Secure SSL checkout
              </p>
            </aside>
          </div>
          )}
        </section>

        <section className="container-shell pb-16" data-testid="cart-frequently-bought-section">
          <h2 className="mb-6 text-3xl font-bold tracking-tight" data-testid="cart-frequently-bought-heading">
            Frequently Bought Together
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="cart-frequently-bought-grid">
            {products.slice(4, 7).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>

        <TrustBar />
      </main>

      <SiteFooter />
    </div>
  );
}