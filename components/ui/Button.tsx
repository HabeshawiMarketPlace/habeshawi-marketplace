import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

type LinkButtonProps = SharedButtonProps & {
  href: string;
  type?: never;
  disabled?: never;
  onClick?: never;
};

type NativeButtonProps = SharedButtonProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  > & {
    href?: never;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#087531] text-white hover:bg-[#064d2b] focus-visible:ring-[#087531]",
  secondary:
    "bg-yellow-400 text-slate-950 hover:bg-yellow-300 focus-visible:ring-yellow-400",
  outline:
    "border border-[#087531] bg-white text-[#087531] hover:bg-green-50 focus-visible:ring-[#087531]",
  ghost:
    "bg-transparent text-[#087531] hover:bg-green-50 focus-visible:ring-[#087531]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

function combineClasses(
  ...classes: Array<string | undefined | false>
) {
  return classes.filter(Boolean).join(" ");
}

export default function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
  } = props;

  const combinedClassName = combineClasses(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold",
    "transition duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={combinedClassName}
      >
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
  props as NativeButtonProps;

  return (
    <button
      type={type}
      className={combinedClassName}
      {...buttonProps}
    >
      {children}
    </button>
  );
}