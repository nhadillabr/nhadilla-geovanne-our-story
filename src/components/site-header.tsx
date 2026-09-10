import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navegacao, wedding } from "@/config/wedding";

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="font-serif text-lg tracking-[0.2em] text-foreground uppercase"
          onClick={() => setAberto(false)}
        >
          N <span className="text-dourado">&</span> G
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navegacao.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[11px] tracking-editorial text-muted-foreground uppercase transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/rsvp"
            className="border border-primary px-5 py-2 text-[11px] tracking-editorial text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Confirmar presença
          </Link>
        </nav>

        <button
          type="button"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="p-2 text-foreground md:hidden"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? <Menu className="size-5 rotate-90" /> : <Menu className="size-5" />}
        </button>
      </div>

      {aberto && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {navegacao.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setAberto(false)}
                className="py-3 text-[12px] tracking-editorial text-muted-foreground uppercase"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/rsvp"
              onClick={() => setAberto(false)}
              className="mt-3 border border-primary px-5 py-3 text-center text-[12px] tracking-editorial text-primary uppercase"
            >
              Confirmar presença
            </Link>
            <p className="mt-4 pb-2 text-[11px] tracking-widest text-muted-foreground/70 uppercase">
              {wedding.dataCurta}
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}

export function CloseIconUnused() {
  return <X />;
}
