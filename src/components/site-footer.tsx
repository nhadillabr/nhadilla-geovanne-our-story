import { wedding } from "@/config/wedding";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-14">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-serif text-2xl tracking-[0.18em] text-foreground uppercase">
          {wedding.noivos}
        </p>
        <div className="rule-gold mx-auto my-5" />
        <p className="text-[11px] tracking-editorial text-muted-foreground uppercase">
          {wedding.dataCurta} — {wedding.cidade}
        </p>
      </div>
    </footer>
  );
}
