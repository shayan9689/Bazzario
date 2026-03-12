import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheckBig, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { initialCartItems, products } from "@/data/storeData";

const shippingOptions = [
  { id: "standard", title: "Standard Shipping", eta: "Arrives in 4-7 business days", price: 0 },
  { id: "express", title: "Express Delivery", eta: "Arrives in 1-2 business days", price: 15 },
];

export default function CheckoutPage() {
  const [shippingMethod, setShippingMethod] = useState("standard");

  const orderItems = useMemo(
    () =>
      initialCartItems
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean)
        .slice(0, 2),
    [],
  );

  const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = shippingMethod === "express" ? 15 : 0;
  const tax = (subtotal + shippingFee) * 0.08;
  const discount = 20;
  const total = subtotal + shippingFee + tax - discount;

  return (
    <div className="app-shell" data-testid="checkout-page-root">
      <SiteHeader cartCount={3} />

      <main className="container-shell py-8 md:py-12" data-testid="checkout-main-section">
        <div className="mb-4 text-sm text-zinc-500" data-testid="checkout-breadcrumb">
          <Link to="/cart" className="hover:text-zinc-900" data-testid="checkout-return-to-cart-link">
            Return to Cart
          </Link>{" "}
          / Checkout
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <section className="space-y-8" data-testid="checkout-form-section">
            <article className="rounded-2xl border border-zinc-200 bg-white p-6" data-testid="checkout-shipping-address-card">
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight" data-testid="checkout-shipping-address-heading">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">1</span>
                Shipping Address
              </h1>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input placeholder="First Name" data-testid="checkout-input-first-name" />
                <Input placeholder="Last Name" data-testid="checkout-input-last-name" />
                <div className="md:col-span-2">
                  <Input placeholder="Address" data-testid="checkout-input-address" />
                </div>
                <div className="md:col-span-2">
                  <Input placeholder="Apartment, suite, etc. (optional)" data-testid="checkout-input-apartment" />
                </div>
                <Input placeholder="City" data-testid="checkout-input-city" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="State" data-testid="checkout-input-state" />
                  <Input placeholder="ZIP Code" data-testid="checkout-input-zip" />
                </div>
                <div className="md:col-span-2">
                  <Input placeholder="Phone Number" data-testid="checkout-input-phone" />
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-6" data-testid="checkout-shipping-method-card">
              <h2 className="flex items-center gap-3 text-2xl font-bold" data-testid="checkout-shipping-method-heading">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">2</span>
                Shipping Method
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2" data-testid="checkout-shipping-options">
                {shippingOptions.map((option) => {
                  const selected = shippingMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setShippingMethod(option.id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        selected ? "border-blue-600 bg-blue-50" : "border-zinc-200"
                      }`}
                      data-testid={`checkout-shipping-option-${option.id}`}
                    >
                      <p className="font-semibold" data-testid={`checkout-shipping-option-title-${option.id}`}>{option.title}</p>
                      <p className="text-sm text-zinc-500" data-testid={`checkout-shipping-option-eta-${option.id}`}>{option.eta}</p>
                      <p className="mt-1 font-semibold text-zinc-900" data-testid={`checkout-shipping-option-price-${option.id}`}>
                        {option.price === 0 ? "Free" : `$${option.price.toFixed(2)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-6" data-testid="checkout-payment-method-card">
              <h2 className="flex items-center gap-3 text-2xl font-bold" data-testid="checkout-payment-heading">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">3</span>
                Payment Method
              </h2>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-zinc-200 p-4" data-testid="checkout-card-payment-panel">
                  <p className="font-semibold" data-testid="checkout-card-payment-title">Credit or Debit Card</p>
                  <div className="mt-3 grid gap-3">
                    <Input placeholder="0000 0000 0000 0000" data-testid="checkout-input-card-number" />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input placeholder="MM/YY" data-testid="checkout-input-card-expiry" />
                      <Input placeholder="CVV" data-testid="checkout-input-card-cvv" />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-zinc-600" data-testid="checkout-billing-same-address-row">
                  <Checkbox defaultChecked data-testid="checkout-billing-same-address-checkbox" />
                  <span data-testid="checkout-billing-same-address-label">Billing address is the same as shipping address</span>
                </label>
              </div>
            </article>
          </section>

          <aside className="space-y-4" data-testid="checkout-summary-column">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5" data-testid="checkout-order-summary-card">
              <h3 className="text-2xl font-bold" data-testid="checkout-order-summary-heading">Order Summary</h3>

              <div className="mt-4 space-y-3" data-testid="checkout-order-items-list">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3" data-testid={`checkout-order-item-${item.id}`}>
                    <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" data-testid={`checkout-order-item-image-${item.id}`} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold" data-testid={`checkout-order-item-name-${item.id}`}>{item.product.name}</p>
                      <p className="text-sm text-zinc-500" data-testid={`checkout-order-item-price-${item.id}`}>${item.product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-y border-zinc-200 py-4 text-sm" data-testid="checkout-summary-breakdown">
                <p className="flex justify-between" data-testid="checkout-summary-subtotal"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
                <p className="flex justify-between" data-testid="checkout-summary-shipping"><span>Shipping</span><span>{shippingFee ? `$${shippingFee.toFixed(2)}` : "Free"}</span></p>
                <p className="flex justify-between" data-testid="checkout-summary-tax"><span>Estimated Tax</span><span>${tax.toFixed(2)}</span></p>
                <p className="flex justify-between text-emerald-600" data-testid="checkout-summary-discount"><span>Promo Discount</span><span>-${discount.toFixed(2)}</span></p>
              </div>

              <p className="mt-4 flex justify-between text-3xl font-bold" data-testid="checkout-summary-total">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </p>

              <div className="mt-4 flex gap-2" data-testid="checkout-promo-row">
                <Input placeholder="Promo code" data-testid="checkout-promo-input" />
                <Button variant="outline" data-testid="checkout-promo-apply-button">Apply</Button>
              </div>

              <Button className="mt-4 h-12 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700" data-testid="checkout-place-order-button">
                Place Order Now
              </Button>
              <p className="mt-2 text-center text-xs text-zinc-500" data-testid="checkout-legal-note">
                By clicking "Place Order Now", you agree to our Terms and Privacy Policy.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-4" data-testid="checkout-security-panel">
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-600">
                <p className="flex flex-col items-center gap-1" data-testid="checkout-security-secure">
                  <LockKeyhole className="h-4 w-4" /> Secure
                </p>
                <p className="flex flex-col items-center gap-1" data-testid="checkout-security-tracked">
                  <PackageCheck className="h-4 w-4" /> Tracked
                </p>
                <p className="flex flex-col items-center gap-1" data-testid="checkout-security-private">
                  <ShieldCheck className="h-4 w-4" /> Private
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-blue-50 p-4" data-testid="checkout-help-panel">
              <p className="flex items-start gap-2 text-sm text-blue-800" data-testid="checkout-help-text">
                <CircleCheckBig className="mt-0.5 h-4 w-4" />
                Need help with your order? Our support team is available 24/7 to assist you.
              </p>
            </article>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}