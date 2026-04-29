import { cn } from "@/lib/utils";

export function BrandMark({
  size = "md",
  suffix,
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  suffix?: string;
  className?: string;
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };
  return (
    <span
      className={cn(
        "inline-flex items-baseline italic font-bold tracking-tight text-zinc-50 select-none",
        sizes[size],
        className,
      )}
    >
      not<span className="text-brand">.</span>
      {suffix && (
        <span className="ml-2 not-italic font-medium text-zinc-400 text-[0.7em] tracking-normal uppercase">
          {suffix}
        </span>
      )}
    </span>
  );
}
