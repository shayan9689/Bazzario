import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Heart, Share2, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import NewsletterBanner from "@/components/layout/NewsletterBanner";
import ProductCard from "@/components/product/ProductCard";
import { productGallery, products, specs } from "@/data/storeData";
import { useStore } from "@/context/StoreContext";

const colorOptions = [
  { id: "black", hex: "#111827", label: "Matte Black" },
  { id: "silver", hex: "#f5f5f4", label: "Cloud White" },
  { id: "blue", hex: "#1d4ed8", label: "Skyline Blue" },
];

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products: catalogProducts, addToCart, isAuthenticated } = useStore();
  const displayProducts = catalogProducts.length ? catalogProducts : products;
  const product = useMemo(() => displayProducts.find((item) => item.id === productId) || displayProducts[0], [productId, displayProducts]);
  const oldPrice = product.old_price ?? product.oldPrice ?? product.price;
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedPackage, setSelectedPackage] = useState("us-9");

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      navigate("/signin");
      return false;
    }

    await addToCart({
      productId: product.id,
      quantity: 1,
      size: selectedPackage,
      color: selectedColor.label,
    });
    toast.success(`${product.name} added to cart`);
    return true;
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (!added) return;
    navigate("/checkout");
  };

  return (
    <div className="app-shell" data-testid="product-page-root">
      <SiteHeader cartCount={3} />

      <main>
        <section className="container-shell py-8 md:py-10" data-testid="product-main-section">
          <p className="text-sm text-zinc-500" data-testid="product-breadcrumb-text">
            <Link to="/shop" className="hover:text-zinc-800" data-testid="product-breadcrumb-shop-link">
              Sneakers
            </Link>{" "}
            / Lifestyle / {product.name}
          </p>

          <div className="mt-4 grid gap-7 lg:grid-cols-[120px_1fr_1fr]">
            <div className="order-2 grid grid-cols-4 gap-3 lg:order-1 lg:grid-cols-1" data-testid="product-gallery-thumbnails">
              {productGallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-blue-600" : "border-transparent"}`}
                  data-testid={`product-thumbnail-button-${index}`}
                >
                  <img src={image} alt={`thumbnail ${index + 1}`} className="h-20 w-full object-cover" data-testid={`product-thumbnail-image-${index}`} />
                </button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="order-1 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 lg:order-2"
              data-testid="product-gallery-main"
            >
              <img
                src={productGallery[activeImage]}
                alt={product.name}
                className="h-[460px] w-full rounded-xl object-contain"
                data-testid="product-main-image"
              />
            </motion.div>

            <div className="order-3" data-testid="product-info-panel">
              <p className="text-sm text-blue-600" data-testid="product-rating-summary">★★★★★ 4.8</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight" data-testid="product-title">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <p className="text-4xl font-extrabold" data-testid="product-current-price">${product.price.toFixed(2)}</p>
                <p className="text-lg text-zinc-400 line-through" data-testid="product-old-price">${oldPrice.toFixed(2)}</p>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700" data-testid="product-discount-badge">
                  Save 23%
                </span>
              </div>

              <p className="mt-4 text-zinc-600" data-testid="product-description">
                Built for all-day movement with responsive cushioning, breathable upper mesh, and durable grip for city and training use.
              </p>

              <div className="mt-6" data-testid="product-color-selector">
                <p className="text-sm font-semibold text-zinc-700" data-testid="product-color-title">Color: {selectedColor.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full border-2 ${selectedColor.id === color.id ? "border-blue-600" : "border-zinc-200"}`}
                      style={{ backgroundColor: color.hex }}
                      data-testid={`product-color-button-${color.id}`}
                      aria-label={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5" data-testid="product-package-selector">
                <p className="text-sm font-semibold text-zinc-700" data-testid="product-package-title">Package Type</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "us-9", label: "US 9" },
                    { id: "us-10", label: "US 10" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPackage(option.id)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                        selectedPackage === option.id ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200"
                      }`}
                      data-testid={`product-package-button-${option.id}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-5 flex items-center gap-2 text-emerald-600" data-testid="product-stock-status">
                <CheckCircle2 className="h-4 w-4" /> In Stock — Ships within 24 hours
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button className="h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700" data-testid="product-add-to-cart-button" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button variant="outline" className="h-12 rounded-full" data-testid="product-buy-now-button" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-around rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600" data-testid="product-benefit-icons">
                <p className="flex items-center gap-2" data-testid="product-benefit-shipping">
                  <Truck className="h-4 w-4" /> Free Shipping
                </p>
                <p className="flex items-center gap-2" data-testid="product-benefit-secure">
                  <ShieldCheck className="h-4 w-4" /> Secure Payments
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded-full border border-zinc-200 p-2" data-testid="product-wishlist-button" aria-label="Save" onClick={() => toast.success("Added to wishlist") }>
                    <Heart className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-full border border-zinc-200 p-2" data-testid="product-share-button" aria-label="Share" onClick={() => toast.success("Share link copied") }>
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell pb-16" data-testid="product-details-tabs-section">
          <Tabs defaultValue="specifications" className="w-full" data-testid="product-tabs-root">
            <TabsList className="grid w-full grid-cols-3" data-testid="product-tabs-list">
              <TabsTrigger value="overview" data-testid="product-tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications" data-testid="product-tab-specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="product-tab-reviews">Reviews (1204)</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="rounded-2xl border border-zinc-200 bg-white p-5" data-testid="product-overview-content">
              <p className="text-zinc-600" data-testid="product-overview-text">
                This Bazzario runner is engineered for speed, daily wear, and premium comfort. Lightweight build and adaptive
                support keep your stride stable from commute to cardio.
              </p>
            </TabsContent>

            <TabsContent value="specifications" className="rounded-2xl border border-zinc-200 bg-white p-5" data-testid="product-specifications-content">
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                {specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-2 border-b border-zinc-200 p-3 last:border-b-0" data-testid={`product-spec-row-${spec.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <p className="font-semibold text-zinc-700" data-testid={`product-spec-label-${spec.label.toLowerCase().replace(/\s+/g, "-")}`}>{spec.label}</p>
                    <p className="text-zinc-600" data-testid={`product-spec-value-${spec.label.toLowerCase().replace(/\s+/g, "-")}`}>{spec.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="rounded-2xl border border-zinc-200 bg-white p-5" data-testid="product-reviews-content">
              <p className="text-zinc-600" data-testid="product-reviews-text">
                "Best noise cancelling I have used" — Emily R. · "Battery life is incredible" — Jacob T.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <section className="container-shell py-12" data-testid="product-related-section">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-4xl font-bold tracking-tight" data-testid="product-related-heading">You Might Also Like</h2>
            <Link to="/shop" className="text-sm font-semibold text-zinc-700" data-testid="product-related-view-all-link">
              View All Collections
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="product-related-grid">
            {displayProducts.slice(1, 5).map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>

        <NewsletterBanner />
      </main>

      <SiteFooter />
    </div>
  );
}