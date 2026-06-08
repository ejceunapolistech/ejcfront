"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  CalendarDays, CircleDollarSign, HeartHandshake,
  HomeIcon, LogOut, Menu, Settings, UserRound, UsersRound,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/app/assets/img/logo-2025.png";

// ── Navegação do evento atual ──────────────────────────────────────────────
const NAV_EVENT = [
  {
    href: (id: string | null) => id ? `/dashboard/${id}` : "/dashboard",
    match: "/dashboard",
    icon: HomeIcon,
    label: "Dashboard",
  },
  {
    href: (id: string | null) => id ? `/meet/${id}` : "/meet",
    match: "/meet",
    icon: UserRound,
    label: "Encontristas",
  },
  {
    href: (id: string | null) => id ? `/encounters/${id}` : "/encounters",
    match: "/encounters",
    icon: HeartHandshake,
    label: "Encontreiros",
  },
  {
    href: (id: string | null) => id ? `/teams/${id}` : "/teams",
    match: "/teams",
    icon: UsersRound,
    label: "Equipes",
  },
  {
    href: () => "/transactions",
    match: "/transactions",
    icon: CircleDollarSign,
    label: "Transações",
  },
];

// ── Ações globais do sistema ───────────────────────────────────────────────
const NAV_GLOBAL = [
  {
    href: () => "/events",
    match: "/events",
    icon: CalendarDays,
    label: "Meus eventos",
  },
];

// ── Estilos reutilizáveis ──────────────────────────────────────────────────
const linkBase =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200";
const linkActive =
  "bg-[#7C5CFF]/12 text-[#C4B5FD] border border-[#7C5CFF]/28";
const linkIdle =
  "text-[#7C8AA5] hover:text-[#F8FAFC] hover:bg-white/[0.04]";

// ── Componente principal ───────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [idEvento, setIdEvento] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("idEvento");
    if (stored) setIdEvento(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("idEvento");
    router.push("/");
  };

  const isActive = (match: string) => pathname.startsWith(match);

  return (
    <div className="flex w-full flex-col">

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 border-r border-[#20293A] bg-[#080B12] sm:flex flex-col">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-1.5 px-2 py-4 flex-1">

            {/* Evento */}
            {NAV_EVENT.map(({ href, match, icon: Icon, label }) => (
              <Tooltip key={match}>
                <TooltipTrigger asChild>
                  <Link
                    href={href(idEvento)}
                    aria-label={label}
                    className={`${linkBase} ${isActive(match) ? linkActive : linkIdle}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#101624] border-[#20293A] text-slate-100">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Separador */}
            <div className="w-6 h-px bg-[#20293A] my-1" />

            {/* Global */}
            {NAV_GLOBAL.map(({ href, match, icon: Icon, label }) => (
              <Tooltip key={match}>
                <TooltipTrigger asChild>
                  <Link
                    href={href()}
                    aria-label={label}
                    className={`${linkBase} ${isActive(match) ? linkActive : linkIdle}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#101624] border-[#20293A] text-slate-100">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="flex-1" />

            {/* Configurações */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={idEvento ? `/configure-event/${idEvento}` : "/configure-event"}
                  aria-label="Configurações"
                  className={`${linkBase} ${isActive("/configure-event") ? linkActive : linkIdle}`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#101624] border-[#20293A] text-slate-100">
                Configurações
              </TooltipContent>
            </Tooltip>

            {/* Sair */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  aria-label="Sair"
                  className={`${linkBase} text-[#7C8AA5] hover:text-red-400 hover:bg-red-500/10`}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sair</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#101624] border-[#20293A] text-slate-100">
                Sair
              </TooltipContent>
            </Tooltip>

          </nav>
        </TooltipProvider>
      </aside>

      {/* ── Mobile header ────────────────────────────────────────────── */}
      <div className="sm:hidden flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b border-[#20293A] bg-[#080B12] gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                aria-label="Abrir menu"
                className="border-[#20293A] bg-transparent text-[#7C8AA5] hover:text-white hover:bg-white/5"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#080B12] border-r border-[#20293A] text-slate-100 w-64 p-0">
              <div className="flex flex-col h-full">

                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-[#20293A]">
                  <Image
                    src={logo}
                    alt="EJC Eunápolis"
                    className="w-9 h-auto rounded-lg"
                  />
                  <span className="text-sm font-semibold text-slate-100">EJC Eunápolis</span>
                </div>

                <nav className="flex flex-col gap-1 p-3 flex-1">
                  {/* Evento */}
                  <p className="text-[10px] font-semibold text-[#7C8AA5] uppercase tracking-widest px-3 pt-2 pb-1">
                    Evento
                  </p>
                  {NAV_EVENT.map(({ href, match, icon: Icon, label }) => (
                    <Link
                      key={match}
                      href={href(idEvento)}
                      aria-label={label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                        isActive(match)
                          ? "text-[#C4B5FD] bg-[#7C5CFF]/12 border border-[#7C5CFF]/28"
                          : "text-[#7C8AA5] hover:text-slate-100 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </Link>
                  ))}

                  {/* Separador */}
                  <div className="h-px bg-[#20293A] my-2 mx-1" />

                  {/* Global */}
                  <p className="text-[10px] font-semibold text-[#7C8AA5] uppercase tracking-widest px-3 pb-1">
                    Geral
                  </p>
                  {NAV_GLOBAL.map(({ href, match, icon: Icon, label }) => (
                    <Link
                      key={match}
                      href={href()}
                      aria-label={label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                        isActive(match)
                          ? "text-[#C4B5FD] bg-[#7C5CFF]/12 border border-[#7C5CFF]/28"
                          : "text-[#7C8AA5] hover:text-slate-100 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </Link>
                  ))}

                  <Link
                    href={idEvento ? `/configure-event/${idEvento}` : "/configure-event"}
                    aria-label="Configurações"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                      isActive("/configure-event")
                        ? "text-[#C4B5FD] bg-[#7C5CFF]/12 border border-[#7C5CFF]/28"
                        : "text-[#7C8AA5] hover:text-slate-100 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    Configurações
                  </Link>
                </nav>

                {/* Sair */}
                <div className="p-3 border-t border-[#20293A]">
                  <button
                    onClick={handleLogout}
                    aria-label="Sair"
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7C8AA5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    Sair
                  </button>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </header>
      </div>

    </div>
  );
}
