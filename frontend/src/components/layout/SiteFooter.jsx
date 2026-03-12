import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { footerColumns } from "@/data/storeData";

const socialLinks = [
  { id: "twitter", icon: Twitter },
  { id: "facebook", icon: Facebook },
  { id: "instagram", icon: Instagram },
  { id: "youtube", icon: Youtube },
];

const columnList = [
  { id: "shop", title: "Shop", items: footerColumns.shop },
  { id: "support", title: "Support", items: footerColumns.support },
  { id: "company", title: "Company", items: footerColumns.company },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white" data-testid="site-footer">
      <div className="container-shell grid gap-12 py-14 md:grid-cols-[2fr_1fr_1fr_1fr] md:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-2" data-testid="footer-logo-link">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white" data-testid="footer-logo-icon">
              ▣
            </span>
            <span className="font-heading text-3xl font-extrabold tracking-tight text-blue-600" data-testid="footer-logo-text">
              ShopCentral
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600" data-testid="footer-brand-description">
            The ultimate destination for premium shopping, quality products, lightning-fast delivery, and world-class support.
          </p>
          <div className="mt-5 flex items-center gap-3" data-testid="footer-social-links">
            {socialLinks.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
                data-testid={`footer-social-${id}`}
                aria-label={id}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {columnList.map((column) => (
          <div key={column.id} data-testid={`footer-column-${column.id}`}>
            <h3 className="font-heading text-lg font-bold" data-testid={`footer-column-title-${column.id}`}>
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {column.items.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                    data-testid={`footer-link-${column.id}-${item.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200">
        <div className="container-shell flex flex-col gap-3 py-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="footer-copyright">© 2026 ShopCentral Inc. All rights reserved.</p>
          <div className="flex gap-5" data-testid="footer-legal-links">
            <button type="button" className="hover:text-zinc-800" data-testid="footer-privacy-link">
              Privacy
            </button>
            <button type="button" className="hover:text-zinc-800" data-testid="footer-terms-link">
              Terms
            </button>
            <button type="button" className="hover:text-zinc-800" data-testid="footer-shipping-policy-link">
              Shipping Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}