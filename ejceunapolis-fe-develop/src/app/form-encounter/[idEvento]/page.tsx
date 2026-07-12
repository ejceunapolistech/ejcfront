"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import logo from "@/app/assets/img/logo-2025.png";
import {
  CheckCircle2, ChevronRight, ChevronLeft, User, MapPin,
  Users, CreditCard, Loader2, History, Search,
} from "lucide-react";
import TeamLabel from "@/components/team/team-label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getTeamInfo } from "@/constants/team-icons";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EQUIPE_FRENTE_OPTIONS = [
  { value: "BANDINHA",    label: "Bandinha" },
  { value: "BOA_VONTADE", label: "Boa Vontade" },
  { value: "BISCOITO",    label: "Biscoito" },
  { value: "SOCIODRAMA",  label: "Sociodrama" },
  { value: "TRANSITO",    label: "Trânsito" },
  { value: "NAO_OPTAR",   label: "Não Optar" },
  { value: "GARCONS",     label: "Garçons" },
];

const EQUIPE_FUNDO_OPTIONS = [
  { value: "ORACAO",      label: "Oração" },
  { value: "ORDERM",      label: "Ordem" },
  { value: "MIDIA",       label: "Mídia" },
  { value: "RECEPCAO",    label: "Recepção" },
  { value: "COZINHA",     label: "Cozinha" },
  { value: "CIRCULO",     label: "Círculo" },
  { value: "SECRETARIA",  label: "Secretaria" },
  { value: "APOIO",       label: "Apoio" },
  { value: "CERIMONIAL",  label: "Cerimonial" },
  { value: "ROTEIRO",     label: "Roteiro" },
  { value: "REFEITORIO",  label: "Refeitório" },
  { value: "NAO_OPTAR",   label: "Não Optar" },
];

const FRENTE_LABEL_TO_VALUE: Record<string, string> = {
  "Bandinha":   "BANDINHA",
  "Boa Vontade": "BOA_VONTADE",
  "Biscoito":   "BISCOITO",
  "Sociodrama": "SOCIODRAMA",
  "Trânsito":   "TRANSITO",
  "Não Optar":  "NAO_OPTAR",
  "Garçons":    "GARCONS",
};

const FUNDO_LABEL_TO_VALUE: Record<string, string> = {
  "Oração":    "ORACAO",
  "Ordem":      "ORDERM",
  "Mídia":      "MIDIA",
  "Recepção":  "RECEPCAO",
  "Cozinha":    "COZINHA",
  "Círculo":    "CIRCULO",
  "Secretaria": "SECRETARIA",
  "Apoio":      "APOIO",
  "Cerimonial": "CERIMONIAL",
  "Roteiro":    "ROTEIRO",
  "Refeitório": "REFEITORIO",
  "Não Optar":  "NAO_OPTAR",
};
// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface HistoricoItem {
  idEncontreiro: string;
  nomeCompleto: string | null;
  nomeEvento: string;
  equipeFrente1: string | null;
  equipeFrente2: string | null;
  equipeFundo1: string | null;
  equipeFundo2: string | null;
}

interface DadosMaisRecentes {
  nomeCompleto: string;
  whatsapp: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  religiao: string;
  equipeFrente1: string | null;
  equipeFrente2: string | null;
  equipeFundo1: string | null;
  equipeFundo2: string | null;
}

interface HistoricoEncontristaItem {
  idEncontrista: string;
  nomeCompleto: string;
  circulo: string;
}

interface HistoricoResponse {
  email: string;
  veterano: boolean;
  dadosMaisRecentes: DadosMaisRecentes | null;
  historicoEncontreiro: HistoricoItem[];
  historicoEncontrista: HistoricoEncontristaItem[];
}

interface FormData {
  nomeCompleto: string;
  emailEncontreiro: string;
  whatsapp: string;
  instagram: string;
  cidade: string;
  logradouro: string;
  numero: string;
  bairro: string;
  estado: string;
  religiao: string;
  equipeFrente1: string;
  equipeFrente2: string;
  equipeFundo1: string;
  equipeFundo2: string;
  veterano: boolean;
}
// ---------------------------------------------------------------------------
// Steps config
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, label: "Dados Pessoais", icon: User },
  { id: 2, label: "Endereço",       icon: MapPin },
  { id: 3, label: "Equipes",        icon: Users },
  { id: 4, label: "Pagamento",      icon: CreditCard },
];

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="border-white/10 bg-[#0B1020] focus:ring-[#6D3DF2]">
        <SelectValue placeholder={placeholder}>
          {value ? <TeamLabel teamCode={value} /> : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const info = getTeamInfo(o.value);
          const Icon = info?.icon;
          return (
            <SelectItem key={o.value} value={o.value}>
              <span className="inline-flex items-center gap-2">
                {Icon && <Icon size={14} className="opacity-75 shrink-0" />}
                {o.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-white/10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-100 text-right max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}
// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Returns "1ª", "2ª", "3ª" ... */
function ordinal(n: number): string {
  return n + "ª";
}

const CIRCULO_COLORS: Record<string, string> = {
  AZUL:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  VERMELHO: "bg-red-500/20 text-red-300 border-red-500/30",
  VERDE:    "bg-green-500/20 text-green-300 border-green-500/30",
  AMARELO:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function CirculoBadge({ circulo }: { circulo: string }) {
  const cls = CIRCULO_COLORS[circulo?.toUpperCase()] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {circulo}
    </span>
  );
}
// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function EncounterForm() {
  const params = useParams();
  const idEvento = params?.idEvento as string;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  type Screen = "welcome" | "history-email" | "history-select" | "form";

  // UI state
  const [screen, setScreen] = useState<Screen>("welcome");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEmail, setHistoryEmail] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");

  // History state
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [historicoEncontrista, setHistoricoEncontrista] = useState<
    { idEncontrista: string; nomeCompleto: string; circulo: string }[]
  >([]);
  const [dadosMaisRecentesGlobal, setDadosMaisRecentesGlobal] =
    useState<DadosMaisRecentes | null>(null);

  // Equipe config state (ativa/inativa)
  const [equipeConfigs, setEquipeConfigs] = useState<
    { nomeEquipe: string; tipoEquipe: string; ativa: boolean }[]
  >([]);

  useEffect(() => {
    if (!idEvento) return;
    axios
      .get(`${API_BASE_URL}/ejceunapolis/api/equipe/config/${idEvento}`)
      .then((r) => setEquipeConfigs(r.data))
      .catch(() => setEquipeConfigs([]));
  }, [idEvento]);

  const isEquipeAtiva = (nomeEquipe: string, tipoEquipe: string) => {
    const cfg = equipeConfigs.find(
      (c) => c.nomeEquipe === nomeEquipe && c.tipoEquipe === tipoEquipe
    );
    return cfg ? cfg.ativa : true;
  };

  const equipeFrenteOptions = useMemo(
    () => EQUIPE_FRENTE_OPTIONS.filter((o) => isEquipeAtiva(o.value, "FRENTE")),
    [equipeConfigs]
  );
  const equipeFundoOptions = useMemo(
    () => EQUIPE_FUNDO_OPTIONS.filter((o) => isEquipeAtiva(o.value, "FUNDO")),
    [equipeConfigs]
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    emailEncontreiro: "",
    whatsapp: "",
    instagram: "",
    cidade: "",
    logradouro: "",
    numero: "",
    bairro: "",
    estado: "",
    religiao: "",
    equipeFrente1: "",
    equipeFrente2: "",
    equipeFundo1: "",
    equipeFundo2: "",
    veterano: false,
  });
  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const set = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const formatPhone = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    let value = target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length >= 7)
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    else if (value.length >= 3)
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    target.value = value;
    set("whatsapp", value);
  };

  const preencheFormComHistorico = (dados: DadosMaisRecentes) => {
    setFormData((prev) => ({
      ...prev,
      nomeCompleto: dados.nomeCompleto ?? prev.nomeCompleto,
      whatsapp:     dados.whatsapp     ?? prev.whatsapp,
      logradouro:   dados.logradouro   ?? prev.logradouro,
      numero:       dados.numero       ?? prev.numero,
      bairro:       dados.bairro       ?? prev.bairro,
      cidade:       dados.cidade       ?? prev.cidade,
      estado:       dados.estado       ?? prev.estado,
      religiao:     dados.religiao     ?? prev.religiao,
      equipeFrente1: dados.equipeFrente1
        ? (FRENTE_LABEL_TO_VALUE[dados.equipeFrente1] ?? "")
        : "",
      equipeFrente2: dados.equipeFrente2
        ? (FRENTE_LABEL_TO_VALUE[dados.equipeFrente2] ?? "")
        : "",
      equipeFundo1: dados.equipeFundo1
        ? (FUNDO_LABEL_TO_VALUE[dados.equipeFundo1] ?? "")
        : "",
      equipeFundo2: dados.equipeFundo2
        ? (FUNDO_LABEL_TO_VALUE[dados.equipeFundo2] ?? "")
        : "",
    }));
  };
  const handleSearchHistory = async () => {
    if (!historyEmail.trim()) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await axios.get<HistoricoResponse[]>(
        `${API_BASE_URL}/ejceunapolis/api/encontreiro/buscar/historico/email`,
        { params: { email: historyEmail } }
      );
      const data = response.data;
      const todosHistoricos = data.flatMap((r) => r.historicoEncontreiro);

      if (todosHistoricos.length === 0) {
        setHistoryError("Nenhum registro encontrado para este e-mail.");
        return;
      }

      set("emailEncontreiro", historyEmail);

      if (todosHistoricos.length === 1) {
        const recentes = data[0].dadosMaisRecentes;
        if (recentes) preencheFormComHistorico(recentes);
        setScreen("form");
      } else {
        setHistorico(todosHistoricos);
        setHistoricoEncontrista(data.flatMap((r) => r.historicoEncontrista ?? []));
        setDadosMaisRecentesGlobal(data[0]?.dadosMaisRecentes ?? null);
        setScreen("history-select");
      }
    } catch {
      setHistoryError("Erro ao buscar histórico. Verifique o e-mail e tente novamente.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectHistorico = (item: HistoricoItem) => {
    setFormData((prev) => ({
      ...prev,
      equipeFrente1: item.equipeFrente1
        ? (FRENTE_LABEL_TO_VALUE[item.equipeFrente1] ?? "")
        : "",
      equipeFrente2: item.equipeFrente2
        ? (FRENTE_LABEL_TO_VALUE[item.equipeFrente2] ?? "")
        : "",
      equipeFundo1: item.equipeFundo1
        ? (FUNDO_LABEL_TO_VALUE[item.equipeFundo1] ?? "")
        : "",
      equipeFundo2: item.equipeFundo2
        ? (FUNDO_LABEL_TO_VALUE[item.equipeFundo2] ?? "")
        : "",
    }));
    setScreen("form");
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const isStep1Valid =
    formData.nomeCompleto.trim() !== "" &&
    formData.emailEncontreiro.trim() !== "" &&
    formData.whatsapp.trim() !== "" &&
    formData.religiao.trim() !== "";

  const isStep2Valid =
    formData.cidade.trim() !== "" &&
    formData.logradouro.trim() !== "" &&
    formData.numero.trim() !== "" &&
    formData.bairro.trim() !== "" &&
    formData.estado.trim() !== "";

  const isStep3Valid =
    formData.equipeFundo1 !== "" && formData.equipeFundo2 !== "";

  const canAdvance =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid);
  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/encontreiro/${idEvento}`,
        formData,
        { headers: { "Content-Type": "application/json", Accept: "*/*" } }
      );
      const idEncontreiro = response.data.idEncontreiro;
      const pagamentoResponse = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/pagamentos/cartao`,
        { idEvento, idEncontreiro },
        { headers: { "Content-Type": "application/json", Accept: "*/*" } }
      );
      window.location.href = pagamentoResponse.data.linkPagamento;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Erro ao enviar os dados. Tente novamente."
        );
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A13] via-[#0A0D18] to-[#120A1F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src={logo}
            alt="EJC Eunápolis"
            className="w-20 h-auto rounded-xl shadow-sm mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-50">
            Inscrição de Encontreiro
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Preencha os dados para confirmar sua participação
          </p>
        </div>
        {/* ================================================================ */}
        {/* WELCOME SCREEN                                                   */}
        {/* ================================================================ */}
        {screen === "welcome" && (
          <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#6D3DF2]/15 border border-[#6D3DF2]/30 flex items-center justify-center mx-auto">
              <History className="w-8 h-8 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-50 mb-2">
                Você já participou como encontreiro?
              </h2>
              <p className="text-sm text-slate-500">
                Se você já trabalhou em edições anteriores, podemos
                pré-preencher seus dados automaticamente.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setScreen("history-email")}
                className="bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-8 h-11"
              >
                Sim, já participei
              </Button>
              <Button
                variant="outline"
                onClick={() => setScreen("form")}
                className="border border-white/10 bg-transparent text-slate-100 hover:bg-white/5 rounded-xl px-8 h-11"
              >
                Não, é minha primeira vez
              </Button>
            </div>
          </div>
        )}
        {/* ================================================================ */}
        {/* HISTORY-EMAIL SCREEN                                             */}
        {/* ================================================================ */}
        {screen === "history-email" && (
          <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("welcome")}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  Buscar histórico
                </h2>
                <p className="text-sm text-slate-500">
                  Informe o e-mail usado nas edições anteriores
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-300">
                E-mail utilizado anteriormente
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={historyEmail}
                  onChange={(e) => setHistoryEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchHistory()}
                  placeholder="seu@email.com"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearchHistory}
                  disabled={historyLoading || !historyEmail.trim()}
                  className="bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-4"
                >
                  {historyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {historyError && (
                <p className="text-sm text-rose-400">{historyError}</p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                set("emailEncontreiro", historyEmail);
                setScreen("form");
              }}
              className="w-full text-slate-500 text-sm hover:text-slate-300"
            >
              Pular e preencher manualmente
            </Button>
          </div>
        )}
        {/* ================================================================ */}
        {/* HISTORY-SELECT SCREEN                                            */}
        {/* ================================================================ */}
        {screen === "history-select" && (
          <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-8 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("history-email")}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  Selecione uma edição
                </h2>
                <p className="text-sm text-slate-500">
                  Encontramos {historico.length} cadastro(s) com este e-mail. Escolha qual deseja usar para pré-preencher.
                </p>
              </div>
            </div>

            {/* Encontreiro participation list */}
            <div className="space-y-3">
              {historico.map((item) => {
                const fundoBadges = Array.from(
                  new Set([item.equipeFundo1, item.equipeFundo2].filter(Boolean) as string[])
                );
                const frenteBadges = Array.from(
                  new Set([item.equipeFrente1, item.equipeFrente2].filter(Boolean) as string[])
                );

                return (
                  <button
                    key={item.idEncontreiro}
                    onClick={() => handleSelectHistorico(item)}
                    className="w-full text-left rounded-xl border-2 border-white/10 hover:border-[#6D3DF2]/40 hover:bg-[#6D3DF2]/10 px-4 py-4 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Nome do encontreiro cadastrado */}
                        <p className="font-semibold text-slate-100 group-hover:text-[#A78BFA] truncate">
                          {item.nomeCompleto?.trim() || "Nome não informado"}
                        </p>

                        {/* Equipe badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {fundoBadges.map((eq) => (
                            <span
                              key={`fundo-${eq}`}
                              className="inline-flex items-center gap-1 text-xs bg-[#6D3DF2]/20 text-[#A78BFA] px-2 py-0.5 rounded-full border border-[#6D3DF2]/30"
                            >
                              <span className="opacity-60">Fundo:</span>
                              <TeamLabel teamCode={eq} size={11} />
                            </span>
                          ))}
                          {frenteBadges.map((eq) => (
                            <span
                              key={`frente-${eq}`}
                              className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30"
                            >
                              <span className="opacity-60">Frente:</span>
                              <TeamLabel teamCode={eq} size={11} />
                            </span>
                          ))}
                          {fundoBadges.length === 0 && frenteBadges.length === 0 && (
                            <span className="text-xs text-slate-500 italic">Sem equipes registradas</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#A78BFA] ml-3 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              onClick={() => setScreen("form")}
              className="w-full text-slate-500 text-sm hover:text-slate-300"
            >
              Preencher manualmente sem usar histórico
            </Button>
          </div>
        )}
        {/* ================================================================ */}
        {/* FORM SCREEN                                                      */}
        {/* ================================================================ */}
        {screen === "form" && (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isCompleted = step > s.id;
                const isCurrent = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                          ${isCompleted ? "bg-[#6D3DF2] text-white" : ""}
                          ${isCurrent ? "bg-[#6D3DF2] text-white ring-4 ring-purple-950/40" : ""}
                          ${!isCompleted && !isCurrent ? "bg-transparent border-2 border-white/15 text-slate-400" : ""}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:block ${
                          isCurrent || isCompleted ? "text-[#A78BFA]" : "text-gray-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                          step > s.id ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Form card */}
            <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-6 sm:p-8">

              {/* ---- Step 1: Dados Pessoais ---- */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-slate-50 mb-4">
                    Dados Pessoais
                  </h2>
                  <FormField label="Nome completo" required>
                    <Input
                      value={formData.nomeCompleto}
                      onChange={(e) => set("nomeCompleto", e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </FormField>
                  <FormField label="E-mail" required>
                    <Input
                      type="email"
                      value={formData.emailEncontreiro}
                      onChange={(e) => set("emailEncontreiro", e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </FormField>
                  <FormField label="WhatsApp" required>
                    <Input
                      type="text"
                      value={formData.whatsapp}
                      onInput={formatPhone}
                      onChange={(e) => set("whatsapp", e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </FormField>
                  <FormField label="Religião" required>
                    <Input
                      value={formData.religiao}
                      onChange={(e) => set("religiao", e.target.value)}
                      placeholder="Ex: Católico"
                    />
                  </FormField>
                  <FormField label="Instagram">
                    <Input
                      value={formData.instagram}
                      onChange={(e) => set("instagram", e.target.value)}
                      placeholder="@seuperfil"
                    />
                  </FormField>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, veterano: !prev.veterano }))}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                      formData.veterano
                        ? "border-[#6D3DF2] bg-[#6D3DF2]/10"
                        : "border-white/10 bg-transparent hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${formData.veterano ? "text-[#A78BFA]" : "text-slate-300"}`}>
                          Já participei como encontreiro em edições anteriores
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Marque se você já trabalhou em um EJC anterior</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        formData.veterano ? "border-[#6D3DF2] bg-[#6D3DF2]" : "border-slate-600"
                      }`}>
                        {formData.veterano && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                </div>
              )}
              {/* ---- Step 2: Endereço ---- */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-slate-50 mb-4">
                    Endereço
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Logradouro" required>
                      <Input
                        value={formData.logradouro}
                        onChange={(e) => set("logradouro", e.target.value)}
                        placeholder="Rua, Av..."
                      />
                    </FormField>
                    <FormField label="Número" required>
                      <Input
                        value={formData.numero}
                        onChange={(e) => set("numero", e.target.value)}
                        placeholder="123"
                      />
                    </FormField>
                    <FormField label="Bairro" required>
                      <Input
                        value={formData.bairro}
                        onChange={(e) => set("bairro", e.target.value)}
                        placeholder="Seu bairro"
                      />
                    </FormField>
                    <FormField label="Cidade" required>
                      <Input
                        value={formData.cidade}
                        onChange={(e) => set("cidade", e.target.value)}
                        placeholder="Sua cidade"
                      />
                    </FormField>
                    <FormField label="Estado" required>
                      <Input
                        value={formData.estado}
                        onChange={(e) => set("estado", e.target.value.toUpperCase())}
                        placeholder="BA"
                        maxLength={2}
                        className="uppercase"
                      />
                    </FormField>
                  </div>
                </div>
              )}
              {/* ---- Step 3: Equipes ---- */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-50 mb-1">
                      Preferência de Equipes
                    </h2>
                    <p className="text-sm text-slate-500">
                      Escolha suas preferências. As equipes de frente são opcionais.
                    </p>
                  </div>

                  {/* Frente */}
                  <div className="rounded-xl border border-[#6D3DF2]/30 bg-[#6D3DF2]/5 p-4 space-y-4">
                    <p className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wide">
                      Equipe de Frente <span className="text-slate-500 normal-case font-normal">(opcional)</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="1ª opção">
                        <SelectField
                          id="equipeFrente1"
                          value={formData.equipeFrente1}
                          onChange={(v) => set("equipeFrente1", v)}
                          options={equipeFrenteOptions}
                          placeholder="Selecione..."
                        />
                      </FormField>
                      <FormField label="2ª opção">
                        <SelectField
                          id="equipeFrente2"
                          value={formData.equipeFrente2}
                          onChange={(v) => set("equipeFrente2", v)}
                          options={equipeFrenteOptions}
                          placeholder="Selecione..."
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* Fundo */}
                  <div className="rounded-xl border border-[#FBBF24]/25 bg-[#FBBF24]/5 p-4 space-y-4">
                    <p className="text-xs font-semibold text-[#FBBF24] uppercase tracking-wide">
                      Equipe de Fundo <span className="text-rose-500">*</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="1ª opção" required>
                        <SelectField
                          id="equipeFundo1"
                          value={formData.equipeFundo1}
                          onChange={(v) => set("equipeFundo1", v)}
                          options={equipeFundoOptions}
                          placeholder="Selecione..."
                        />
                      </FormField>
                      <FormField label="2ª opção" required>
                        <SelectField
                          id="equipeFundo2"
                          value={formData.equipeFundo2}
                          onChange={(v) => set("equipeFundo2", v)}
                          options={equipeFundoOptions}
                          placeholder="Selecione..."
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}
              {/* ---- Step 4: Revisão e Pagamento ---- */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-slate-50 mb-4">
                    Revisão e Pagamento
                  </h2>
                  <div className="space-y-3">
                    <ReviewSection title="Dados Pessoais">
                      <ReviewRow label="Nome"     value={formData.nomeCompleto} />
                      <ReviewRow label="E-mail"   value={formData.emailEncontreiro} />
                      <ReviewRow label="WhatsApp" value={formData.whatsapp} />
                      <ReviewRow label="Religião" value={formData.religiao} />
                    </ReviewSection>
                    <ReviewSection title="Endereço">
                      <ReviewRow
                        label="Endereço"
                        value={`${formData.logradouro}, ${formData.numero} - ${formData.bairro}`}
                      />
                      <ReviewRow
                        label="Cidade/Estado"
                        value={`${formData.cidade} / ${formData.estado.toUpperCase()}`}
                      />
                    </ReviewSection>
                    <ReviewSection title="Equipes">
                      {formData.equipeFrente1 && (
                        <ReviewRow
                          label="Frente 1ª"
                          value={<TeamLabel teamCode={formData.equipeFrente1} />}
                        />
                      )}
                      {formData.equipeFrente2 && (
                        <ReviewRow
                          label="Frente 2ª"
                          value={<TeamLabel teamCode={formData.equipeFrente2} />}
                        />
                      )}
                      <ReviewRow
                        label="Fundo 1ª"
                        value={<TeamLabel teamCode={formData.equipeFundo1} />}
                      />
                      <ReviewRow
                        label="Fundo 2ª"
                        value={<TeamLabel teamCode={formData.equipeFundo2} />}
                      />
                    </ReviewSection>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-12 text-base bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      "Confirmar e Pagar Inscrição"
                    )}
                  </Button>
                </div>
              )}
              {/* Navigation buttons */}
              {step < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      step === 1 ? setScreen("welcome") : setStep((s) => s - 1)
                    }
                    className="gap-1 text-slate-400 hover:text-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance}
                    className="gap-1 bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-6"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {step === 4 && (
                <div className="flex justify-start mt-6 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(3)}
                    className="gap-1 text-slate-400 hover:text-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                </div>
              )}

            </div>{/* /form card */}
          </>
        )}{/* /screen === form */}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          EJC Eunápolis — Seus dados estão protegidos
        </p>

      </div>
    </div>
  );
}
