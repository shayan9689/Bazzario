import { useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product/ProductCard";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import NewsletterBanner from "@/components/layout/NewsletterBanner";
import { products } from "@/data/storeData";

function sortProducts(list, sort) {
  const cloned = [...list];
  if (sort === "price-low") return cloned.sort((a, b) => a.price - b.price);
  if (sort === "price-high") return cloned.sort((a, b) => b.price - a.price);
  if (sort === "top-rated") return cloned.sort((a, b) => b.rating - a.rating);
  return cloned;
}

export default function ShopPage() {
  const categoryFilters = useMemo(() => [...new Set(products.map((product) => product.category))], []);
  const brandFilters = useMemo(() => [...new Set(products.map((product) => product.brand))], []);
  const [selectedCategories, setSelectedCategories] = useState(["Running"]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("featured");
  const [viewType, setViewType] = useState("grid");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredProducts = useMemo(() => {
    const byFilter = products.filter((product) => {
      const categoryPass = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const brandPass = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const pricePass = product.price <= maxPrice;
      return categoryPass && brandPass && pricePass;
    });
    return sortProducts(byFilter, sortBy);
  }, [selectedCategories, selectedBrands, maxPrice, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const toggleFilter = (values, setter, value) => {
    const hasValue = values.includes(value);
    setter(hasValue ? values.filter((v) => v !== value) : [...values, value]);
    setPage(1);
  };

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(500);
    setSortBy("featured");
    setPage(1);
  };

  return (
    <div className="app-shell" data-testid="shop-page-root">
      <SiteHeader cartCount={3} />

      <main>
        <section className="container-shell py-8 md:py-10" data-testid="shop-top-banner-section">
          <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600" data-testid="shop-banner-eyebrow">
                Trending Sneakers 2026
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl" data-testid="shop-banner-heading">
                Crafted Sneakers for Daily Performance
              </h1>
              <p className="mt-3 max-w-xl text-zinc-600" data-testid="shop-banner-description">
                Explore sports-ready and street-ready collections curated for modern style and comfort.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl" data-testid="shop-banner-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1608380272894-b3617f04b463?auto=format&fit=crop&w=1300&q=80"
                alt="Premium sneakers"
                className="h-64 w-full object-cover"
                data-testid="shop-banner-image"
              />
            </div>
          </div>
        </section>

        <section className="container-shell pb-16 md:pb-24" data-testid="shop-content-section">
          <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5" data-testid="shop-filters-sidebar">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold" data-testid="shop-filters-title">
                  Filters
                </h2>
                <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="space-y-6">
                <div data-testid="shop-category-filter-group">
                  <h3 className="text-sm font-semibold" data-testid="shop-category-filter-title">
                    Product Category
                  </h3>
                  <div className="mt-3 space-y-2">
                    {categoryFilters.map((category) => (
                      <label key={category} className="flex items-center gap-2 text-sm text-zinc-700" data-testid={`shop-filter-category-row-${category.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                          data-testid={`shop-filter-category-checkbox-${category.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <span data-testid={`shop-filter-category-label-${category.toLowerCase().replace(/\s+/g, "-")}`}>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div data-testid="shop-price-filter-group">
                  <h3 className="text-sm font-semibold" data-testid="shop-price-filter-title">
                    Price Range
                  </h3>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={maxPrice}
                    onChange={(event) => {
                      setMaxPrice(Number(event.target.value));
                      setPage(1);
                    }}
                    className="mt-3 w-full"
                    data-testid="shop-price-filter-slider"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-600" data-testid="shop-price-filter-values">
                    <Input readOnly value="$50" data-testid="shop-price-min-input" />
                    <Input readOnly value={`$${maxPrice}`} data-testid="shop-price-max-input" />
                  </div>
                </div>

                <div data-testid="shop-brand-filter-group">
                  <h3 className="text-sm font-semibold" data-testid="shop-brand-filter-title">
                    Brand
                  </h3>
                  <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                    {brandFilters.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-zinc-700" data-testid={`shop-filter-brand-row-${brand.toLowerCase()}`}>
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                          data-testid={`shop-filter-brand-checkbox-${brand.toLowerCase()}`}
                        />
                        <span data-testid={`shop-filter-brand-label-${brand.toLowerCase()}`}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4" data-testid="shop-flash-sale-widget">
                  <p className="inline-flex rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white" data-testid="shop-flash-sale-tag">
                    Promo
                  </p>
                  <h4 className="mt-2 font-bold text-zinc-900" data-testid="shop-flash-sale-heading">
                    Flash Sale!
                  </h4>
                  <p className="mt-1 text-sm text-zinc-600" data-testid="shop-flash-sale-description">
                    Get up to 70% off on electronics this weekend. Use code VIBE2026.
                  </p>
                  <Button className="mt-4 h-10 w-full rounded-full bg-white text-zinc-900 hover:bg-zinc-100" data-testid="shop-flash-sale-button">
                    Shop Now
                  </Button>
                </div>
              </div>
            </aside>

            <div data-testid="shop-products-container">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                <div>
                  <p className="text-xs text-zinc-500" data-testid="shop-breadcrumb-text">
                    Home / Shop / All Products
                  </p>
                  <h2 className="mt-1 text-3xl font-bold" data-testid="shop-products-heading">
                    All Sneaker Collections
                  </h2>
                  <p className="text-sm text-zinc-500" data-testid="shop-products-count-text">
                    Showing {filteredProducts.length} products
                  </p>
                </div>

                <div className="flex items-center gap-2" data-testid="shop-top-controls">
                  <button
                    type="button"
                    className={`rounded-lg border p-2 ${viewType === "grid" ? "border-blue-600 text-blue-600" : "border-zinc-200 text-zinc-500"}`}
                    onClick={() => setViewType("grid")}
                    data-testid="shop-grid-view-button"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg border p-2 ${viewType === "list" ? "border-blue-600 text-blue-600" : "border-zinc-200 text-zinc-500"}`}
                    onClick={() => setViewType("list")}
                    data-testid="shop-list-view-button"
                  >
                    <List className="h-4 w-4" />
                  </button>

                  <select
                    className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    data-testid="shop-sort-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="top-rated">Top Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {paginatedProducts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={viewType === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-4" : "grid gap-5"}
                  data-testid="shop-products-grid"
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} compact={viewType === "list"} />
                  ))}
                </motion.div>
              ) : (
                <motion.article
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center"
                  data-testid="shop-empty-state"
                >
                  <h3 className="text-2xl font-bold" data-testid="shop-empty-state-title">
                    No products found
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-zinc-600" data-testid="shop-empty-state-description">
                    Try adjusting category, brand, or price filters to discover more products.
                  </p>
                  <Button
                    type="button"
                    onClick={resetAllFilters}
                    className="mt-5 h-11 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700"
                    data-testid="shop-empty-state-reset-button"
                  >
                    Reset Filters
                  </Button>
                </motion.article>
              )}

              {paginatedProducts.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2" data-testid="shop-pagination-controls">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-9 min-w-9 rounded-md border px-3 text-sm ${
                        page === pageNumber ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 text-zinc-700"
                      }`}
                      data-testid={`shop-pagination-button-${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <NewsletterBanner />
      </main>

      <SiteFooter />
    </div>
  );
}