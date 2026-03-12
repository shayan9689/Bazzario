import { ArrowRight, MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/SiteHeader";
import TrustBar from "@/components/layout/TrustBar";
import NewsletterBanner from "@/components/layout/NewsletterBanner";
import SiteFooter from "@/components/layout/SiteFooter";
import ProductCard from "@/components/product/ProductCard";
import { categoryCards, heroBanner, products } from "@/data/storeData";
import { fadeUp, staggerParent } from "@/components/shared/motion";
import { useStore } from "@/context/StoreContext";

function CategoryCard({ category }) {
  return (
    <motion.article variants={fadeUp} className="group relative overflow-hidden rounded-2xl" data-testid={`home-category-card-${category.id}`}>
      <img
        src={category.image}
        alt={category.title}
        className="h-64 w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        data-testid={`home-category-image-${category.id}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-2xl font-semibold" data-testid={`home-category-title-${category.id}`}>
          {category.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-200" data-testid={`home-category-description-${category.id}`}>
          {category.description}
        </p>
      </div>
    </motion.article>
  );
}

export default function HomePage() {
  const { products: catalogProducts } = useStore();
  const displayProducts = catalogProducts.length ? catalogProducts : products;

  return (
    <div className="app-shell" data-testid="home-page-root">
      <SiteHeader cartCount={3} />

      <main>
        <section className="container-shell py-8 md:py-12" data-testid="home-hero-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl"
          >
            <img
              src={heroBanner.image}
              alt="Luxury storefront"
              className="h-[420px] w-full object-cover object-center md:h-[520px]"
              data-testid="home-hero-image"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 grid items-end p-7 md:p-12">
              <div className="max-w-2xl text-white">
                <p className="inline-flex rounded-full border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" data-testid="home-hero-eyebrow">
                  {heroBanner.eyebrow}
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-6xl" data-testid="home-hero-heading">
                  {heroBanner.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm text-zinc-100 md:text-lg" data-testid="home-hero-subtitle">
                  {heroBanner.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/shop" data-testid="home-hero-shop-button-link">
                    <Button className="h-12 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700" data-testid="home-hero-shop-button">
                      Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/product/velocity-pro-runner" data-testid="home-hero-details-button-link">
                    <Button variant="outline" className="h-12 rounded-full border-white bg-transparent px-8 text-white hover:bg-white hover:text-zinc-900" data-testid="home-hero-details-button">
                      Explore Deals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <TrustBar />

        <section className="container-shell py-16 md:py-24" data-testid="home-categories-section">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600" data-testid="home-categories-eyebrow">
                Shop by category
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight" data-testid="home-categories-heading">
                Discover your next favorite picks
              </h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900" data-testid="home-categories-view-all-link">
              View all categories <MoveRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {categoryCards.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </motion.div>
        </section>

        <section className="container-shell pb-16" data-testid="home-promo-section">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            className="grid gap-7 rounded-3xl bg-blue-600 p-7 text-white md:grid-cols-2 md:items-center md:p-10"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100" data-testid="home-promo-eyebrow">
                Limited time
              </p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight" data-testid="home-promo-heading">
                Flash Sale Up to 40% Off Tech Accessories
              </h3>
              <p className="mt-2 text-blue-100" data-testid="home-promo-description">
                Shop headphones, wearables, and premium audio gear with free express shipping included.
              </p>
              <div className="mt-5 flex gap-3">
                <Link to="/shop" data-testid="home-promo-shop-now-link">
                  <Button className="h-11 rounded-full bg-white px-7 text-zinc-900 hover:bg-zinc-100" data-testid="home-promo-shop-now-button">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/product/velocity-pro-runner" data-testid="home-promo-view-product-link">
                  <Button variant="outline" className="h-11 rounded-full border-white bg-transparent px-7 text-white hover:bg-white hover:text-zinc-900" data-testid="home-promo-view-product-button">
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white/20 p-2" data-testid="home-promo-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1620790458588-c6c4a0d68a84?auto=format&fit=crop&w=1000&q=80"
                alt="Sneaker promo"
                className="h-56 w-full rounded-xl object-cover"
                data-testid="home-promo-image"
              />
            </div>
          </motion.div>
        </section>

        <section className="container-shell py-16 md:py-24" data-testid="home-trending-section">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600" data-testid="home-trending-eyebrow">
              Hot this week
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight" data-testid="home-trending-heading">
              Trending This Week
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-zinc-600" data-testid="home-trending-description">
              Hand-picked products combining performance, elegance, and innovation for your daily lifestyle.
            </p>
          </div>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {displayProducts.map((product) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 text-center">
            <Link to="/shop" data-testid="home-trending-view-all-link">
              <Button variant="outline" className="h-11 rounded-full px-8" data-testid="home-trending-view-all-button">
                Explore All Products
              </Button>
            </Link>
          </div>
        </section>

        <NewsletterBanner />
      </main>

      <SiteFooter />
    </div>
  );
}