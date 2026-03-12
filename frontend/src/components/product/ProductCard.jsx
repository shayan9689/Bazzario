import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

export default function ProductCard({ product, compact = false }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
      data-testid={`product-card-${product.id}`}
    >
      <div className={`relative overflow-hidden rounded-xl bg-zinc-50 ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          data-testid={`product-card-image-${product.id}`}
        />
        <Badge
          className="absolute left-3 top-3 border-transparent bg-emerald-100 text-emerald-700"
          data-testid={`product-card-tag-${product.id}`}
        >
          {product.tag}
        </Badge>
      </div>

      <div className="pt-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500" data-testid={`product-card-brand-${product.id}`}>
          {product.brand}
        </p>
        <Link to={`/product/${product.id}`} className="mt-1 block" data-testid={`product-card-link-${product.id}`}>
          <h3 className="line-clamp-2 text-base font-bold text-zinc-900" data-testid={`product-card-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600" data-testid={`product-card-rating-${product.id}`}>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{product.rating}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-zinc-900" data-testid={`product-card-price-${product.id}`}>
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-zinc-500 line-through" data-testid={`product-card-old-price-${product.id}`}>
              {formatCurrency(product.oldPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
              data-testid={`product-card-wishlist-button-${product.id}`}
              aria-label={`wishlist ${product.name}`}
              onClick={() => toast.success(`${product.name} saved to wishlist`)}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
              data-testid={`product-card-add-to-cart-button-${product.id}`}
              aria-label={`add ${product.name} to cart`}
              onClick={() => toast.success(`${product.name} added to cart`)}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}