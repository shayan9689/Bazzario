import { Link } from "react-router-dom";

export default function BazzarioLogo({ to = "/", iconOnly = false, className = "", testIdPrefix = "bazzario-logo" }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`} data-testid={`${testIdPrefix}-link`} aria-label="Bazzario Home">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm"
        data-testid={`${testIdPrefix}-icon`}
      >
        B
      </span>
      {!iconOnly && (
        <span className="inline-flex items-end leading-none" data-testid={`${testIdPrefix}-text-wrap`}>
          <span className="font-logo-script text-3xl text-blue-600 sm:text-4xl" data-testid={`${testIdPrefix}-script-text`}>
            Bazz
          </span>
          <span className="font-heading -ml-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl" data-testid={`${testIdPrefix}-main-text`}>
            ario
          </span>
        </span>
      )}
    </Link>
  );
}
