import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { footerColumns } from "@/data/storeData";
import BazzarioLogo from "@/components/branding/BazzarioLogo";

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
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" data-testid="site-footer">
      <div className="container-shell grid gap-12 py-14 md:grid-cols-[2fr_1fr_1fr_1fr] md:py-16">
        <div>
          <BazzarioLogo className="w-fit" testIdPrefix="footer-logo" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600" data-testid="footer-brand-description">
            Bazzario is the home of premium shopping — curated drops, quality products, and world-class support.
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
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
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

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="container-shell flex flex-col gap-3 py-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="footer-copyright">© 2026 Bazzario Inc. All rights reserved.</p>
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