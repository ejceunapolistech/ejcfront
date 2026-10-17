"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Clock3, Loader2, Moon } from "lucide-react";
import logo from "@/app/assets/img/logo-2025.png";

const BAHIA_TIME_ZONE = "America/Bahia";
const FRIDAY_BLOCK_START_SECONDS = 17 * 60 * 60;
const SATURDAY_BLOCK_END_SECONDS = 18 * 60 * 60;

interface SabbathStatus {
  blocked: boolean;
  secondsUntilReopening: number;
}

const bahiaDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BAHIA_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getSabbathStatus(date = new Date()): SabbathStatus {
  const parts = Object.fromEntries(
    bahiaDateFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value])
  );

  const secondsOfDay =
    Number(parts.hour) * 60 * 60 +
    Number(parts.minute) * 60 +
    Number(parts.second);

  if (parts.weekday === "Fri" && secondsOfDay >= FRIDAY_BLOCK_START_SECONDS) {
    return {
      blocked: true,
      secondsUntilReopening:
        24 * 60 * 60 - secondsOfDay + SATURDAY_BLOCK_END_SECONDS,
    };
  }

  if (parts.weekday === "Sat" && secondsOfDay < SATURDAY_BLOCK_END_SECONDS) {
    return {
      blocked: true,
      secondsUntilReopening: SATURDAY_BLOCK_END_SECONDS - secondsOfDay,
    };
  }

  return { blocked: false, secondsUntilReopening: 0 };
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function SabbathRegistrationGuard({
  children,
}: {
  children: ReactNode;
}) {
  const [status, setStatus] = useState<SabbathStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => setStatus(getSabbathStatus());

    updateStatus();
    const interval = window.setInterval(updateStatus, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (status === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070A13] via-[#0A0D18] to-[#120A1F] flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#A78BFA]" aria-label="Verificando disponibilidade das inscrições" />
      </div>
    );
  }

  if (!status.blocked) return children;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#070A13] via-[#0A0D18] to-[#120A1F] flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <Image
          src={logo}
          alt="EJC Eunápolis"
          className="mx-auto mb-5 h-auto w-20 rounded-xl shadow-sm"
          priority
        />

        <section className="rounded-3xl border border-violet-400/20 bg-[#101522]/95 p-6 shadow-2xl shadow-black/40 sm:p-9">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10">
            <Moon className="h-8 w-8 text-[#C4B5FD]" aria-hidden="true" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#A78BFA]">
            EJC Eunápolis
          </p>
          <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">
            Estamos no período sabático
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            Como este é um evento adventista, as inscrições e os pagamentos
            ficam temporariamente indisponíveis de sexta-feira, às 17h, até
            sábado, às 18h.
          </p>

          <div className="my-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Disponível novamente em
            </div>
            <p className="mt-2 font-mono text-3xl font-bold tracking-wider text-violet-300" aria-live="polite">
              {formatCountdown(status.secondsUntilReopening)}
            </p>
            <p className="mt-1 text-xs text-slate-500">sábado, às 18h</p>
          </div>

          <blockquote className="rounded-2xl border-l-4 border-violet-500 bg-violet-500/5 px-5 py-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-violet-300">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide">Palavra de Deus</span>
            </div>
            <p className="text-sm italic leading-6 text-slate-300">
              “Lembra-te do dia de sábado, para o santificar.”
            </p>
            <cite className="mt-2 block text-xs not-italic text-slate-500">
              Êxodo 20:8
            </cite>
          </blockquote>

          <p className="mt-6 text-sm text-slate-400">
            Agradecemos a compreensão e desejamos um sábado abençoado!
          </p>
        </section>
      </div>
    </main>
  );
}
