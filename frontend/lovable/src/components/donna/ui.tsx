import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors duration-150";

export const btn = {
  primary: cn(base, "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed"),
  secondary: cn(base, "border border-border-strong bg-card text-foreground hover:bg-accent"),
  ghost: cn(base, "px-3 text-primary hover:bg-accent"),
  onInk: cn(base, "on-ink-focus bg-on-ink text-ink hover:bg-accent"),
};

export function DonnaMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-primary font-serif text-[15px] text-primary-foreground", className)}>
      D
    </span>
  );
}

export function Bubble({ from, children, ...rest }: { from: "donna" | "user"; children: ReactNode } & ComponentPropsWithoutRef<"div">) {
  if (from === "user") {
    return (
      <div {...rest} className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-accent px-4 py-2.5 text-[15px]">
        <span className="sr-only">Tú: </span>
        {children}
      </div>
    );
  }
  return (
    <div {...rest} className="flex max-w-[92%] gap-3">
      <DonnaMark />
      <div className="text-[15px]">
        <span className="sr-only">Donna: </span>
        {children}
      </div>
    </div>
  );
}
