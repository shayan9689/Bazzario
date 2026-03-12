import { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingBag, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { navItems } from "@/data/storeData";

const getNavClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-black" : "text-zinc-500 hover:text-black"}`;

const routeLabelMap = {
  "/": "Home",
  "/shop": "Shop",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/auth": "Sign In",
};

export default function SiteHeader({ cartCount = 0 }) {
  const { pathname } = useLocation();
  const routeLabel = useMemo(() => routeLabelMap[pathname] || "Product", [pathname]);

  return (
    <motion.header
      initial={{ y: -26, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-zinc-200/80 glass-nav"
      data-testid="site-main-header"
    >
      <div className="container-shell flex h-20 items-center gap-2 md:gap-4">
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-2 md:flex-none"
          data-testid="header-logo-link"
          aria-label="Go to home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"
            data-testid="header-logo-icon"
          >
            <ShoppingBag className="h-4 w-4" />
          </span>
          <span
            className="font-heading max-w-[148px] truncate text-xl font-extrabold tracking-tight text-blue-600 sm:max-w-none sm:text-2xl"
            data-testid="header-logo-text"
          >
            ShopCentral
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" data-testid="header-primary-nav">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.path} className={getNavClass} data-testid={`header-nav-${item.label.toLowerCase()}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-auto hidden w-full max-w-md items-center md:flex" data-testid="header-search-container">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              readOnly
              value=""
              placeholder="Search products..."
              className="h-11 rounded-full border-zinc-200 pl-9"
              data-testid="header-search-input"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3" data-testid="header-action-group">
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-zinc-100" data-testid="header-cart-link" aria-label="Open cart">
            <ShoppingBag className="h-5 w-5" />
            <span
              className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white"
              data-testid="header-cart-count"
            >
              {cartCount}
            </span>
          </Link>
          <Link to="/auth" className="rounded-full p-1 hover:bg-zinc-100" data-testid="header-profile-link" aria-label="Open account">
            <UserCircle2 className="h-7 w-7 text-zinc-700" />
          </Link>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-5 py-2 text-xs text-zinc-500 md:hidden" data-testid="header-mobile-route-label">
        You are viewing: <span className="font-semibold text-zinc-800">{routeLabel}</span>
      </div>
    </motion.header>
  );
}