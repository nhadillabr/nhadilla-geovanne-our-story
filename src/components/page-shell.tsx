import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="text-center">
      {kicker && (
        <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">{kicker}</p>
      )}
      <h2 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">{title}</h2>
      <div className="rule-gold mx-auto mt-6" />
    </div>
  );
}
