import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(ms / 86400000),
    horas: Math.floor((ms / 3600000) % 24),
    minutos: Math.floor((ms / 60000) % 60),
    segundos: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown() {
  const target = new Date(wedding.dataISO).getTime();
  const [tempo, setTempo] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setTempo(diff(target));
    const id = setInterval(() => setTempo(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const itens = [
    { label: "Dias", valor: tempo?.dias },
    { label: "Horas", valor: tempo?.horas },
    { label: "Minutos", valor: tempo?.minutos },
    { label: "Segundos", valor: tempo?.segundos },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-8">
      {itens.map((item) => (
        <div key={item.label} className="text-center">
          <p className="font-serif text-3xl text-foreground tabular-nums sm:text-5xl">
            {item.valor === undefined ? "—" : String(item.valor).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[10px] tracking-editorial text-muted-foreground uppercase">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
