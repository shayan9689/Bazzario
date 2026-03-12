import { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Search, Settings2, ShoppingBag, Sun, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { navItems } from "@/data/storeData";
import { useThemeMode } from "@/context/ThemeContext";
import BazzarioLogo from "@/components/branding/BazzarioLogo";

const getNavClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-black" : "text-zinc-500 hover:text-black"}`;

const routeLabelMap = {
  "/": "Home",
  "/shop": "Shop",
  "/search-results": "Search",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/account": "My Account",
  "/signin": "Sign In",
  "/signup": "Sign Up",
};

export default function SiteHeader({ cartCount = 0 }) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useThemeMode();
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
        <BazzarioLogo className="min-w-0 flex-1 md:flex-none" testIdPrefix="header-logo" />

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
            <Input readOnly value="" placeholder="Search products..." className="h-11 rounded-full border-zinc-200 pl-9" data-testid="header-search-input" />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3" data-testid="header-action-group">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            data-testid="header-theme-toggle-button"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/account"
            className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            data-testid="header-settings-link"
            aria-label="Open settings"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-zinc-100" data-testid="header-cart-link" aria-label="Open cart">
            <ShoppingBag className="h-5 w-5" />
            <span
              className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white"
              data-testid="header-cart-count"
            >
              {cartCount}
            </span>
          </Link>
          <Link to="/signin" className="rounded-full p-1 hover:bg-zinc-100" data-testid="header-profile-link" aria-label="Open account">
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