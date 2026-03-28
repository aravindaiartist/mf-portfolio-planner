import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionWrapper({
  id,
  title,
  description,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20", className)}
    >
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
