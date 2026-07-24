import Image from "next/image";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

function classes(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function DashboardCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes("rounded-2xl bg-white", className)}
      {...props}
    />
  );
}

export function PageHeader({
  action,
  className,
  title,
}: {
  action?: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={classes("flex items-center justify-between gap-4", className)}>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {action}
    </div>
  );
}

const badgeStyles = {
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-info-lighter text-info-dark",
  success: "bg-success-alpha-16 text-success-dark",
  warning: "bg-warning-alpha-16 text-warning-dark",
  error: "bg-error-alpha-16 text-error-dark",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeStyles;
}) {
  return (
    <span
      className={classes(
        "inline-flex min-h-5.5 items-center justify-center rounded-full px-2 py-1 text-xs font-medium",
        badgeStyles[tone],
      )}
    >
      {children}
    </span>
  );
}

const buttonStyles = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  danger: "bg-error text-white hover:bg-error-dark",
} as const;

export const DashboardButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof buttonStyles;
  }
>(function DashboardButton(
  { className, type = "button", variant = "primary", ...props },
  ref,
) {
  return (
    <button
      className={classes(
        "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});

const avatarSizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
} as const;

export function Avatar({
  className,
  name,
  online,
  size = "md",
}: {
  className?: string;
  name: string;
  online?: boolean;
  size?: keyof typeof avatarSizes;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-label={name}
      className={classes(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary-lighter font-bold text-primary-darker",
        avatarSizes[size],
        className,
      )}
      role="img"
    >
      {initials || "?"}
      {online && (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-white" />
      )}
    </span>
  );
}

export function ProductImage({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <Image
      alt={alt}
      className={classes("h-full w-full object-cover", className)}
      height={100}
      src="/dashboard/product-placeholder.png"
      width={100}
    />
  );
}
