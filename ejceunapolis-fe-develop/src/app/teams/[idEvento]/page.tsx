"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Sidebar } from "@/components/sidebar";
import {
  Crown, Settings, Download, Star, Loader2,
  UserCheck, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Constantes ──────────────────────────────────────────────────────────────

const EQUIPES_FRENTE = [
  { value: "BANDINHA",    label: "Bandinha" },
  { value: "BOA_VONTADE", label: "Boa Vontade" },
  { value: "BISCOITO",    label: "Biscoito" },
  { value: "RECEPCAO",    label: "Recepção" },
  { value: "SOCIODRAMA",  label: "Sociodrama" },
  { value: "TRANSITO",    label: "Trânsito" },
  { value: "GARCONS",     label: "Garçons" },
];

const EQUIPES_FUNDO = [
  { value: "ORACAO",      label: "Oração" },
  { value: "ORDERM",      label: "Ordem" },
  { value: "MIDIA",       label: "Mídia" },
  { value: "COZINHA",     label: "Cozinha" },
  { value: "CIRCULO",     label: "Círculo" },
  { value: "SECRETARIA",  label: "Secretaria" },
  { value: "APOIO",       label: "Apoio" },
  { value: "CERIMONIAL",  label: "Cerimonial" },
  { value: "ROTEIRO",     label: "Roteiro" },
  { value: "REFEITORIO",  label: "Refeitório" },
];

const ALL_EQUIPES = [
  ...EQUIPES_FRENTE.map((e) => ({ ...e, tipo: "FRENTE" as const })),
  ...EQUIPES_FUNDO.map((e) => ({ ...e, tipo: "FUNDO" as const })),
];

function labelFor(value: string) {
  return ALL_EQUIPES.find((e) => e.value === value)?.label ?? value;
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Membro {
  idEncontreiro: string;
  nomeCompleto: string;
  whatsapp: string;
  instagram: string;
  veterano: boolean;
  coordenador: boolean;
  idEquipeCoord: string | null;
}

interface ConfigEquipe {
  nomeEquipe: string;
  tipoEquipe: string;
  ativa: boolean;
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const params = useParams();
  const idEvento = params?.idEvento as string;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [selected, setSelected] = useState<{ value: string; tipo: "FRENTE" | "FUNDO" } | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [configs, setConfigs] = useState<ConfigEquipe[]>([]);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [togglingEquipe, setTogglingEquipe] = useState<string | null>(null);
  const [moverOpen, setMoverOpen] = useState<Membro | null>(null);
  const [moverFrente1, setMoverFrente1] = useState("");
  const [moverFrente2, setMoverFrente2] = useState("");
  const [moverFundo1, setMoverFundo1] = useState("");
  const [moverFundo2, setMoverFundo2] = useState("");
  const [savingMover, setSavingMover] = useState(false);
  const [moverError, setMoverError] = useState("");
  const [togglingCoord, setTogglingCoord] = useState<string | null>(null);

  const moverTeams = [moverFrente1, moverFrente2, moverFundo1, moverFundo2];
  const moverSelectionValid =
    moverTeams.every(Boolean) && new Set(moverTeams).size === moverTeams.length;

  const carregarConfigs = () => {
    if (!idEvento) return;
    axios.get(`${API_BASE_URL}/ejceunapolis/api/equipe/config/${idEvento}`)
      .then((r) => setConfigs(r.data))
      .catch(console.error);
  };

  useEffect(() => { carregarConfigs(); }, [idEvento]);

  const isAtiva = (nomeEquipe: string, tipo: string) => {
    const cfg = configs.find((c) => c.nomeEquipe === nomeEquipe && c.tipoEquipe === tipo);
    return cfg ? cfg.ativa : true;
  };

  const carregarMembros = async (equipe: string, tipo: "FRENTE" | "FUNDO") => {
    setSelected({ value: equipe, tipo });
    setLoadingMembros(true);
    setMembros([]);
    try {
      const r = await axios.get(`${API_BASE_URL}/ejceunapolis/api/equipe/${idEvento}/membros`, {
        params: { nomeEquipe: equipe, tipoEquipe: tipo },
      });
      setMembros(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembros(false);
    }
  };

  const toggleConfig = async (nomeEquipe: string, tipoEquipe: string) => {
    setTogglingEquipe(nomeEquipe + tipoEquipe);
    try {
      await axios.patch(
        `${API_BASE_URL}/ejceunapolis/api/equipe/config/${idEvento}/${nomeEquipe}/toggle`,
        null,
        { params: { tipoEquipe } }
      );
      carregarConfigs();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingEquipe(null);
    }
  };

  const toggleCoord = async (membro: Membro) => {
    if (!selected) return;
    setTogglingCoord(membro.idEncontreiro);
    try {
      if (membro.coordenador && membro.idEquipeCoord) {
        await axios.delete(`${API_BASE_URL}/ejceunapolis/api/equipe/coord/${membro.idEquipeCoord}`);
      } else {
        await axios.post(`${API_BASE_URL}/ejceunapolis/api/equipe/coord`, {
          idEvento,
          nomeEquipe: selected.value,
          tipoEquipe: selected.tipo,
          idEncontreiro: membro.idEncontreiro,
        });
      }
      await carregarMembros(selected.value, selected.tipo);
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingCoord(null);
    }
  };

  const abrirMover = (membro: Membro) => {
    setMoverOpen(membro);
    setMoverFrente1("");
    setMoverFrente2("");
    setMoverFundo1("");
    setMoverFundo2("");
    setMoverError("");
  };

  const salvarMover = async () => {
    if (!moverOpen) return;
    if (!moverSelectionValid) {
      setMoverError("Selecione quatro equipes diferentes.");
      return;
    }
    setMoverError("");
    setSavingMover(true);
    try {
      await axios.patch(`${API_BASE_URL}/ejceunapolis/api/equipe/mover/${moverOpen.idEncontreiro}`, {
        equipeFrente1: moverFrente1,
        equipeFrente2: moverFrente2,
        equipeFundo1: moverFundo1,
        equipeFundo2: moverFundo2,
      });
      setMoverOpen(null);
      if (selected) await carregarMembros(selected.value, selected.tipo);
    } catch (e) {
      console.error(e);
      if (axios.isAxiosError(e)) {
        setMoverError(e.response?.data?.message || "Não foi possível alterar as equipes.");
      } else {
        setMoverError("Não foi possível alterar as equipes.");
      }
    } finally {
      setSavingMover(false);
    }
  };

  const exportarCSV = () => {
    if (!selected || membros.length === 0) return;
    const header = ["Nome", "WhatsApp", "Instagram", "Veterano", "Coordenador"].join(";");
    const rows = membros.map((m) =>
      [m.nomeCompleto, m.whatsapp, m.instagram ?? "", m.veterano ? "Sim" : "Não", m.coordenador ? "Sim" : "Não"].join(";")
    );
    const blob = new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `equipe-${labelFor(selected.value)}.csv`;
    a.click();
  };

  const coordenadores = membros.filter((m) => m.coordenador);

  // ── Chip de equipe ────────────────────────────────────────────────────────
  function EquipeChip({ value, tipo, label }: { value: string; tipo: "FRENTE" | "FUNDO"; label: string }) {
    const isSelected = selected?.value === value && selected?.tipo === tipo;
    return (
      <button
        onClick={() => carregarMembros(value, tipo)}
        className={`h-8 px-3 text-sm rounded-lg border transition-all whitespace-nowrap ${
          isSelected
            ? "bg-[#7C5CFF]/15 text-[#C4B5FD] border-[#7C5CFF]/40 font-medium"
            : "text-[#7C8AA5] border-[#20293A] hover:text-slate-200 hover:border-[#7C5CFF]/20 bg-[#101624]"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar />

      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-1">Equipes</h1>
          <p className="text-sm text-slate-400">Gerencie membros e coordenadores por equipe</p>
        </div>
        <Button
          onClick={() => setConfigOpen(true)}
          className="flex items-center gap-2 h-9 bg-transparent border border-[#20293A] text-slate-300 hover:border-[#7C5CFF]/40 hover:text-[#C4B5FD] hover:bg-[#7C5CFF]/5 rounded-xl text-sm"
        >
          <Settings className="w-4 h-4" />
          Configurar
        </Button>
      </div>

      {/* ── Seletor de equipes ── */}
      <div className="bg-[#101624] border border-[#20293A] rounded-2xl p-4 mb-5 space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Frente</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPES_FRENTE.map((eq) => (
              <EquipeChip key={eq.value} value={eq.value} tipo="FRENTE" label={eq.label} />
            ))}
          </div>
        </div>
        <div className="h-px bg-[#20293A]" />
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Fundo</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPES_FUNDO.map((eq) => (
              <EquipeChip key={eq.value} value={eq.value} tipo="FUNDO" label={eq.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Área de membros ── */}
      {!selected ? (
        <div className="bg-[#101624] border border-[#20293A] rounded-2xl h-48 flex items-center justify-center">
          <p className="text-slate-500 text-sm">Selecione uma equipe acima para ver os membros</p>
        </div>
      ) : (
        <>
          {/* Barra de info + ações */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-50">{labelFor(selected.value)}</h2>
              {!loadingMembros && (
                <span className="text-sm text-slate-500">
                  {membros.length} membro{membros.length !== 1 ? "s" : ""}
                  {coordenadores.length > 0 && (
                    <span className="text-amber-400 ml-1.5">
                      · {coordenadores.length} coord{coordenadores.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              )}
            </div>
            <Button
              onClick={exportarCSV}
              disabled={membros.length === 0}
              className="h-9 flex items-center gap-2 bg-transparent border border-[#20293A] text-slate-300 hover:border-[#7C5CFF]/40 hover:text-[#C4B5FD] rounded-xl text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Destaque de coordenadores */}
          {coordenadores.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 mb-4">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-amber-400 font-medium">Coordenadores:</span>
              {coordenadores.map((c) => (
                <span key={c.idEncontreiro} className="text-xs bg-amber-500/10 border border-amber-500/25 text-amber-300 px-2 py-0.5 rounded-full">
                  {c.nomeCompleto}
                </span>
              ))}
            </div>
          )}

          {/* Tabela */}
          {loadingMembros ? (
            <div className="bg-[#101624] border border-[#20293A] rounded-2xl h-40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#7C5CFF] animate-spin" />
            </div>
          ) : membros.length === 0 ? (
            <div className="bg-[#101624] border border-[#20293A] rounded-2xl h-40 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Nenhum membro nesta equipe</p>
            </div>
          ) : (
            <div className="bg-[#101624] border border-[#20293A] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#20293A]">
                    {["Nome", "WhatsApp", "Instagram", "Status", "Ações"].map((h, i) => (
                      <th key={h} className={`text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 ${i >= 2 ? "hidden md:table-cell" : ""} ${h === "Ações" ? "text-right !table-cell" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {membros.map((m) => (
                    <tr key={m.idEncontreiro} className="border-b border-[#20293A]/50 hover:bg-white/[0.02] transition-colors last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">{m.nomeCompleto}</span>
                          {m.coordenador && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          {m.veterano && (
                            <Star className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 sm:hidden">{m.whatsapp}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{m.whatsapp || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{m.instagram || "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {m.veterano && (
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                              Veterano
                            </span>
                          )}
                          {!m.veterano && (
                            <span className="text-[10px] text-slate-600 italic">1ª vez</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleCoord(m)}
                            disabled={togglingCoord === m.idEncontreiro}
                            title={m.coordenador ? "Remover coordenador" : "Definir como coordenador"}
                            className={`h-7 w-7 flex items-center justify-center rounded-lg border transition-all ${
                              m.coordenador
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                : "border-[#20293A] text-slate-500 hover:border-amber-500/30 hover:text-amber-400"
                            }`}
                          >
                            {togglingCoord === m.idEncontreiro
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Crown className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => abrirMover(m)}
                            title="Mover para outra equipe"
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#20293A] text-slate-500 hover:border-[#7C5CFF]/40 hover:text-[#C4B5FD] transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Modal: Configurar equipes (apenas para o formulário de cadastro) ── */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar equipes disponíveis</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 -mt-2">
            Equipes desativadas não aparecerão no formulário de inscrição dos encontreiros. Não afeta esta tela.
          </p>
          <div className="space-y-4 mt-3">
            {[
              { titulo: "FRENTE", equipes: EQUIPES_FRENTE, tipo: "FRENTE" },
              { titulo: "FUNDO",  equipes: EQUIPES_FUNDO,  tipo: "FUNDO" },
            ].map(({ titulo, equipes, tipo }) => (
              <div key={tipo}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{titulo}</p>
                <div className="space-y-1.5">
                  {equipes.map((eq) => {
                    const ativa = isAtiva(eq.value, tipo);
                    const toggling = togglingEquipe === eq.value + tipo;
                    return (
                      <button
                        key={eq.value}
                        onClick={() => toggleConfig(eq.value, tipo)}
                        disabled={toggling}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-sm ${
                          ativa
                            ? "border-green-500/25 bg-green-500/5 text-slate-200 hover:border-green-500/40"
                            : "border-[#20293A] bg-[#0B0F19] text-slate-500 hover:border-red-500/20"
                        }`}
                      >
                        <span>{eq.label}</span>
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${ativa ? "text-green-400" : "text-slate-600"}`}>
                          {toggling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : ativa
                              ? <><Check className="w-3.5 h-3.5" /> Ativa</>
                              : <><X className="w-3.5 h-3.5" /> Inativa</>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Mover encontreiro ── */}
      <Dialog open={!!moverOpen} onOpenChange={(v) => !v && setMoverOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mover {moverOpen?.nomeCompleto}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 -mt-2">Selecione quatro equipes diferentes.</p>
          <div className="space-y-3 mt-3">
            {([
              { label: "Frente — 1ª opção", value: moverFrente1, set: setMoverFrente1, opts: EQUIPES_FRENTE },
              { label: "Frente — 2ª opção", value: moverFrente2, set: setMoverFrente2, opts: EQUIPES_FRENTE },
              { label: "Fundo — 1ª opção",  value: moverFundo1,  set: setMoverFundo1,  opts: EQUIPES_FUNDO },
              { label: "Fundo — 2ª opção",  value: moverFundo2,  set: setMoverFundo2,  opts: EQUIPES_FUNDO },
            ] as const).map(({ label, value, set, opts }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs text-slate-400">{label}</label>
                <Select value={value} onValueChange={set}>
                  <SelectTrigger className="h-9 text-sm bg-[#0B0F19] border-[#20293A]">
                    <SelectValue placeholder="Não optar" />
                  </SelectTrigger>
                  <SelectContent>
                    {opts.map((o) => (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        disabled={moverTeams.includes(o.value) && o.value !== value}
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          {moverError && (
            <p className="text-sm text-rose-400">{moverError}</p>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setMoverOpen(null)}>Cancelar</Button>
            <Button onClick={salvarMover} disabled={savingMover} className="bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white">
              {savingMover ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
