import { useMemo, useState } from "react";
import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/SiteHeader";
import TrustBar from "@/components/layout/TrustBar";
import SiteFooter from "@/components/layout/SiteFooter";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/storeData";

const ratingOptions = [4, 3, 2];
const colorOptions = [
  { id: "black", hex: "#000000" },
  { id: "white", hex: "#ffffff" },
  { id: "red", hex: "#ef4444" },
  { id: "blue", hex: "#2563eb" },
  { id: "green", hex: "#16a34a" },
  { id: "yellow", hex: "#eab308" },
];

export default function SearchResultsPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([50, 220]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const sneakerBase = useMemo(() => [...products], []);
  const categoryFilters = useMemo(() => [...new Set(sneakerBase.map((product) => product.category))], [sneakerBase]);
  const brandFilters = useMemo(() => [...new Set(sneakerBase.map((product) => product.brand))], [sneakerBase]);

  const filteredProducts = useMemo(() => {
    const list = sneakerBase.filter((product) => {
      const categoryPass = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const brandPass = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const pricePass = product.price >= priceRange[0] && product.price <= priceRange[1];
      const ratingPass = selectedRatings.length === 0 || selectedRatings.some((rating) => product.rating >= rating);
      const colorPass = selectedColors.length === 0 || selectedColors.includes(product.colorName);
      return categoryPass && brandPass && pricePass && ratingPass && colorPass;
    });

    if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") return list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [priceRange, selectedBrands, selectedCategories, selectedColors, selectedRatings, sneakerBase, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const toggleChoice = (value, current, setter) => {
    const hasValue = current.includes(value);
    setter(hasValue ? current.filter((entry) => entry !== value) : [...current, value]);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setSelectedColors([]);
    setPriceRange([50, 220]);
    setSortBy("featured");
    setPage(1);
  };

  return (
    <div className="app-shell" data-testid="search-results-page-root">
      <SiteHeader cartCount={3} />

      <main>
        <section className="container-shell py-8 md:py-10" data-testid="search-results-main-section">
          <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" data-testid="search-results-sidebar">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-lg font-bold" data-testid="search-results-filter-title">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </h2>
                <button type="button" onClick={resetFilters} className="text-xs font-semibold text-zinc-500" data-testid="search-results-clear-all-button">
                  Clear All
                </button>
              </div>

              <div className="space-y-7">
                <div data-testid="search-results-category-filter-group">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="search-results-category-heading">
                    Category
                  </h3>
                  <div className="mt-3 space-y-2">
                    {categoryFilters.map((category) => (
                      <label key={category} className="flex items-center gap-2 text-sm text-zinc-600" data-testid={`search-results-category-row-${category.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleChoice(category, selectedCategories, setSelectedCategories)}
                          data-testid={`search-results-category-checkbox-${category.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <span data-testid={`search-results-category-label-${category.toLowerCase().replace(/\s+/g, "-")}`}>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div data-testid="search-results-price-filter-group">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="search-results-price-heading">
                    Price Range
                  </h3>
                  <Slider min={50} max={250} step={5} value={priceRange} onValueChange={setPriceRange} className="mt-4" data-testid="search-results-price-slider" />
                  <p className="mt-2 text-sm text-zinc-500" data-testid="search-results-price-value">
                    ${priceRange[0]} - ${priceRange[1]}
                  </p>
                </div>

                <div data-testid="search-results-brand-filter-group">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="search-results-brand-heading">
                    Brand
                  </h3>
                  <div className="mt-3 space-y-2">
                    {brandFilters.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-zinc-600" data-testid={`search-results-brand-row-${brand.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleChoice(brand, selectedBrands, setSelectedBrands)}
                          data-testid={`search-results-brand-checkbox-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <span data-testid={`search-results-brand-label-${brand.toLowerCase().replace(/\s+/g, "-")}`}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div data-testid="search-results-rating-filter-group">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="search-results-rating-heading">
                    Customer Rating
                  </h3>
                  <div className="mt-3 space-y-2">
                    {ratingOptions.map((rating) => (
                      <label key={rating} className="flex items-center gap-2 text-sm text-zinc-600" data-testid={`search-results-rating-row-${rating}`}>
                        <Checkbox
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={() => toggleChoice(rating, selectedRatings, setSelectedRatings)}
                          data-testid={`search-results-rating-checkbox-${rating}`}
                        />
                        <span data-testid={`search-results-rating-label-${rating}`}>{"★".repeat(rating)} & up</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div data-testid="search-results-color-filter-group">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300" data-testid="search-results-color-heading">
                    Color
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colorOptions.map((color) => {
                      const selected = selectedColors.includes(color.id);
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => toggleChoice(color.id, selectedColors, setSelectedColors)}
                          className={`h-7 w-7 rounded-full border-2 ${selected ? "border-blue-600" : "border-zinc-200"}`}
                          style={{ backgroundColor: color.hex }}
                          data-testid={`search-results-color-button-${color.id}`}
                          aria-label={color.id}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20" data-testid="search-results-member-widget">
                  <h4 className="font-semibold" data-testid="search-results-member-title">Member Exclusive</h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300" data-testid="search-results-member-description">
                    Join for free shipping and early access to drops.
                  </p>
                  <Button className="mt-3 h-10 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700" data-testid="search-results-member-button">
                    Join Now
                  </Button>
                </div>
              </div>
            </aside>

            <div data-testid="search-results-content-panel">
              <p className="text-sm text-zinc-500" data-testid="search-results-breadcrumb">Home / Search Results</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight" data-testid="search-results-heading">
                Showing results for <span className="text-blue-600">"Sneakers"</span>
              </h1>
              <p className="mt-1 text-zinc-500" data-testid="search-results-subheading">
                {filteredProducts.length} premium products found in our collection
              </p>

              <div className="mt-4 flex flex-wrap gap-2" data-testid="search-results-active-tags">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800" data-testid="search-results-tag-price">Price: $50-$220</span>
                {selectedBrands.slice(0, 2).map((brand) => (
                  <span key={brand} className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800" data-testid={`search-results-tag-brand-${brand.toLowerCase()}`}>
                    {brand}
                  </span>
                ))}
                <button type="button" onClick={resetFilters} className="rounded-full px-3 py-1 text-xs font-semibold text-blue-600" data-testid="search-results-simulate-empty-button">
                  Simulate Empty Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3" data-testid="search-results-toolbar">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg border p-2 ${viewMode === "grid" ? "border-blue-600 text-blue-600" : "border-zinc-200 text-zinc-500"}`}
                    data-testid="search-results-grid-view-button"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg border p-2 ${viewMode === "list" ? "border-blue-600 text-blue-600" : "border-zinc-200 text-zinc-500"}`}
                    data-testid="search-results-list-view-button"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  data-testid="search-results-sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price Low-High</option>
                  <option value="price-high">Price High-Low</option>
                </select>
              </div>

              {paginatedProducts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={viewMode === "grid" ? "mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" : "mt-5 grid gap-5"}
                  data-testid="search-results-product-grid"
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} compact={viewMode === "list"} />
                  ))}
                </motion.div>
              ) : (
                <article className="mt-6 rounded-xl border border-dashed border-zinc-300 p-10 text-center" data-testid="search-results-empty-state">
                  <h3 className="text-2xl font-bold" data-testid="search-results-empty-title">No sneakers found</h3>
                  <p className="mt-2 text-zinc-500" data-testid="search-results-empty-description">Try broader filters to see more options.</p>
                  <Button className="mt-4 rounded-full bg-blue-600 text-white" onClick={resetFilters} data-testid="search-results-empty-reset-button">
                    Reset Filters
                  </Button>
                </article>
              )}

              {paginatedProducts.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2" data-testid="search-results-pagination">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-9 min-w-9 rounded-md border px-3 text-sm ${
                        pageNumber === page ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200"
                      }`}
                      data-testid={`search-results-pagination-button-${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <TrustBar />
      </main>

      <SiteFooter />
    </div>
  );
}
