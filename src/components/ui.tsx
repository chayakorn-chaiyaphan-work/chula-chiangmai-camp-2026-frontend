import clsx from "clsx";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { initials } from "../lib/format";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx("brand-mark", compact && "brand-mark--compact")} aria-label="Chula Chiang Mai Camp 2026">
      <span className="brand-mark__cm">CM</span>
      <span className="brand-mark__year">26</span>
    </div>
  );
}

export function Avatar({ src, name, size = "medium" }: { src?: string; name: string; size?: "small" | "medium" | "large" }) {
  if (src) return <img className={clsx("avatar", `avatar--${size}`)} src={src} alt="" referrerPolicy="no-referrer" />;
  return <span className={clsx("avatar avatar--fallback", `avatar--${size}`)}>{initials(name)}</span>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({ className, variant = "primary", icon, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={clsx("button", `button--${variant}`, className)} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={clsx("icon-button", className)} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-intro">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-intro__description">{description}</p>}
      </div>
      {action && <div className="page-intro__action">{action}</div>}
    </header>
  );
}

export function SectionHeader({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading camp details" }: { label?: string }) {
  return (
    <div className="full-state" role="status">
      <BrandMark />
      <LoaderCircle className="spin full-state__loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title = "We could not load this page", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="full-state" role="alert">
      <span className="full-state__error"><AlertCircle size={24} /></span>
      <h1>{title}</h1>
      <p>{message}</p>
      {onRetry && <Button variant="secondary" icon={<RefreshCw size={18} />} onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function InlineAlert({ children, tone = "info", ...props }: HTMLAttributes<HTMLDivElement> & { tone?: "info" | "success" | "warning" | "danger" }) {
  return <div className={clsx("inline-alert", `inline-alert--${tone}`)} {...props}>{children}</div>;
}

export function QueryError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unable to load data";
  return <InlineAlert tone="danger">{message}</InlineAlert>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "pink" | "green" | "amber" | "red" }) {
  return <span className={clsx("status-badge", `status-badge--${tone}`)}>{children}</span>;
}
