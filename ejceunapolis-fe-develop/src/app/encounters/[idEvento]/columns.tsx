"use client";

import axios from 'axios';
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Copy, Eye, Pen, Trash2 } from "lucide-react";
import TeamLabel from "@/components/team/team-label";
import { getTeamInfo } from "@/constants/team-icons";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const equipeFundoOptions = ["ORACAO","ORDERM","MÍDIA","RECEPÇÃO","COZINHA","CÍRCULO","SECRETARIA","APOIO","CERIMONIAL","ROTEIRO","NAO_OPTAR"];
const equipeFrenteOptions = ["BOA_VONTADE","BANDINHA","BISCOITO","SOCIODRAMA","TRANSITO","GARCONS","NAO_OPTAR"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Tipo ────────────────────────────────────────────────────────────────────
export type Encounters = {
  id: string;
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
  statusPagamento: string;
  dataCriacao: string;
  idPagamento: string;
  idPagamentoMp: string;
  veterano: boolean;
};

// ─── Helpers de UI ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-[#20293A] pb-1.5">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#20293A]/60">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}

function CopyableId({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="flex items-center gap-2 bg-[#0B0F19] border border-[#20293A] rounded-lg px-3 py-2">
        <code className="text-xs text-slate-400 flex-1 truncate font-mono">{value || "—"}</code>
        <button onClick={copy} className="text-slate-500 hover:text-slate-200 transition-colors shrink-0" title="Copiar">
          {copied
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }: { tab: string; setTab: (t: "edit" | "info") => void }) {
  return (
    <div className="flex gap-1 bg-[#0B0F19] border border-[#20293A] rounded-lg p-1 mt-1">
      {[
        { id: "edit", label: "Editar dados" },
        { id: "info", label: "Informações" },
      ].map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id as "edit" | "info")}
          className={`flex-1 text-sm py-1.5 rounded-md transition-all ${
            tab === t.id
              ? "bg-[#7C5CFF]/15 text-[#C4B5FD] border border-[#7C5CFF]/28"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Colunas ─────────────────────────────────────────────────────────────────
export const columns: ColumnDef<Encounters>[] = [
  {
    accessorKey: "nomeCompleto",
    header: "Nome Completo",
  },
  {
    id: "equipe",
    header: "Equipes",
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-xs">Frente:</span>
          <TeamLabel teamCode={row.original.equipeFrente1} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-xs">Fundo:</span>
          <TeamLabel teamCode={row.original.equipeFundo1} />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "statusPagamento",
    header: "Pagamento",
  },
  {
    accessorKey: "idPagamentoMp",
    header: "Transação",
    cell: ({ row }) => {
      const idPagamento = row.original.idPagamento;
      const idPagamentoMp = row.getValue("idPagamentoMp") as string | null;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-slate-300">ID Pagamento: {idPagamento}</span>
          {idPagamentoMp
            ? <span className="text-sm text-green-500">Nº Transação: {idPagamentoMp}</span>
            : <span className="text-sm italic text-yellow-600">Nº Transação: Aguardando...</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "dataCriacao",
    header: "Data criação",
    cell: ({ row }) =>
      new Date(row.getValue("dataCriacao") as string).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <Actions encounter={row.original} />,
  },
];

// ─── Actions ─────────────────────────────────────────────────────────────────
const Actions = ({ encounter }: { encounter: Encounters }) => (
  <div className="flex space-x-2">
    <EditEncounter encounter={encounter} />
    <DeleteEncounter encounter={encounter} />
    <ViewEncounter encounter={encounter} />
  </div>
);

// ─── Excluir ──────────────────────────────────────────────────────────────────
const DeleteEncounter = ({ encounter }: { encounter: Encounters }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/ejceunapolis/api/encontreiro/${encounter.id}`);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao excluir encontreiro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="bg-red-500 text-white ml-2" title="Excluir">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Tem certeza de que deseja excluir <strong className="text-slate-200">{encounter.nomeCompleto}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white" disabled={loading}>
              {loading ? "Excluindo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Editar ───────────────────────────────────────────────────────────────────
export const EditEncounter = ({ encounter }: { encounter: Encounters }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"edit" | "info">("edit");
  const [formData, setFormData] = useState({ ...encounter });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setFormData({ ...encounter }); }, [encounter]);

  const set = (field: keyof Encounters, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/ejceunapolis/api/encontreiro/${encounter.id}`,
        formData,
        { headers: { Accept: "*/*", "Content-Type": "application/json" } }
      );
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar encontreiro:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => { setOpen(true); setTab("edit"); }} className="bg-blue-500 text-white" title="Editar">
        <Pen className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{encounter.nomeCompleto}</DialogTitle>
          </DialogHeader>

          <TabBar tab={tab} setTab={setTab} />

          {/* ── Aba: Editar dados ── */}
          {tab === "edit" && (
            <div className="space-y-5 mt-3">

              <Section title="Dados Pessoais">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nome completo">
                    <Input value={formData.nomeCompleto} onChange={(e) => set("nomeCompleto", e.target.value)} />
                  </Field>
                  <Field label="E-mail">
                    <Input value={formData.emailEncontreiro} onChange={(e) => set("emailEncontreiro", e.target.value)} />
                  </Field>
                  <Field label="WhatsApp">
                    <Input value={formData.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                  </Field>
                  <Field label="Instagram">
                    <Input value={formData.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="@seuperfil" />
                  </Field>
                  <Field label="Religião">
                    <Input value={formData.religiao} onChange={(e) => set("religiao", e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="Endereço">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Logradouro">
                    <Input value={formData.logradouro} onChange={(e) => set("logradouro", e.target.value)} />
                  </Field>
                  <Field label="Número">
                    <Input value={formData.numero} onChange={(e) => set("numero", e.target.value)} />
                  </Field>
                  <Field label="Bairro">
                    <Input value={formData.bairro} onChange={(e) => set("bairro", e.target.value)} />
                  </Field>
                  <Field label="Cidade">
                    <Input value={formData.cidade} onChange={(e) => set("cidade", e.target.value)} />
                  </Field>
                  <Field label="Estado">
                    <Input value={formData.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} maxLength={2} className="uppercase" />
                  </Field>
                </div>
              </Section>

              <Section title="Equipes">
                <div className="space-y-1.5 pb-2 border-b border-[#20293A]/60">
                  <p className="text-xs text-slate-500">Opções escolhidas no cadastro</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[encounter.equipeFrente1, encounter.equipeFrente2].filter(Boolean).map((eq) => (
                      <span key={`fe-${eq}`} className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                        <span className="opacity-60">Frente:</span>
                        <TeamLabel teamCode={eq!} size={11} />
                      </span>
                    ))}
                    {[encounter.equipeFundo1, encounter.equipeFundo2].filter(Boolean).map((eq) => (
                      <span key={`fu-${eq}`} className="inline-flex items-center gap-1 text-xs bg-[#7C5CFF]/20 text-[#C4B5FD] px-2 py-0.5 rounded-full border border-[#7C5CFF]/30">
                        <span className="opacity-60">Fundo:</span>
                        <TeamLabel teamCode={eq!} size={11} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { name: "equipeFrente1" as keyof Encounters, label: "Equipe Frente 1ª", options: equipeFrenteOptions },
                    { name: "equipeFrente2" as keyof Encounters, label: "Equipe Frente 2ª", options: equipeFrenteOptions },
                    { name: "equipeFundo1"  as keyof Encounters, label: "Equipe Fundo 1ª",  options: equipeFundoOptions },
                    { name: "equipeFundo2"  as keyof Encounters, label: "Equipe Fundo 2ª",  options: equipeFundoOptions },
                  ].map(({ name, label, options }) => (
                    <Field key={name} label={label}>
                      <Select
                        value={formData[name] as string}
                        onValueChange={(v) => set(name, v)}
                      >
                        <SelectTrigger className="border-[#20293A] bg-[#0B0F19]">
                          <SelectValue>
                            <TeamLabel teamCode={formData[name] as string} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => {
                            const info = getTeamInfo(option);
                            const Icon = info?.icon;
                            return (
                              <SelectItem key={option} value={option}>
                                <span className="inline-flex items-center gap-2">
                                  {Icon && <Icon size={14} className="opacity-75 shrink-0" />}
                                  {info?.label ?? option}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </Field>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* ── Aba: Informações ── */}
          {tab === "info" && (
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${encounter.veterano ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-700/30 text-slate-500 border-slate-600/30"}`}>
                  {encounter.veterano ? "⭐ Veterano" : "Primeira vez"}
                </span>
              </div>
              <InfoRow label="Status de pagamento" value={encounter.statusPagamento || "—"} />
              <InfoRow
                label="Data de cadastro"
                value={new Date(encounter.dataCriacao).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              />

              <div className="space-y-3 pt-1">
                <CopyableId label="ID Pagamento" value={encounter.idPagamento} />
                {encounter.idPagamentoMp && (
                  <CopyableId label="Nº Transação (Mercado Pago)" value={encounter.idPagamentoMp} />
                )}
              </div>

              <div className="h-px bg-[#20293A] my-1" />
              <CopyableId label="ID do Encontreiro" value={encounter.id} />
            </div>
          )}

          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            {tab === "edit" && (
              <Button onClick={handleSave} disabled={saving} className="bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Visualizar ───────────────────────────────────────────────────────────────
const ViewEncounter = ({ encounter }: { encounter: Encounters }) => {
  const [open, setOpen] = useState(false);

  const LABELS: Partial<Record<keyof Encounters, string>> = {
    nomeCompleto:    "Nome completo",
    emailEncontreiro: "E-mail",
    whatsapp:        "WhatsApp",
    instagram:       "Instagram",
    religiao:        "Religião",
    logradouro:      "Logradouro",
    numero:          "Número",
    bairro:          "Bairro",
    cidade:          "Cidade",
    estado:          "Estado",
    equipeFrente1:   "Equipe Frente 1ª",
    equipeFrente2:   "Equipe Frente 2ª",
    equipeFundo1:    "Equipe Fundo 1ª",
    equipeFundo2:    "Equipe Fundo 2ª",
    statusPagamento: "Status de pagamento",
    dataCriacao:     "Data de cadastro",
    idPagamento:     "ID Pagamento",
    idPagamentoMp:   "Nº Transação (MP)",
    id:              "ID do Encontreiro",
  };

  const TEAM_FIELDS = new Set(["equipeFrente1", "equipeFrente2", "equipeFundo1", "equipeFundo2"]);

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)} className="text-white" title="Visualizar">
        <Eye className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Detalhes — {encounter.nomeCompleto}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {(Object.keys(LABELS) as Array<keyof Encounters>).map((key) => {
              const raw = encounter[key];
              const isDate = key === "dataCriacao";
              const isTeam = TEAM_FIELDS.has(key);

              let display: React.ReactNode;
              if (isDate && raw) {
                display = new Date(raw as string).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
              } else if (isTeam && raw) {
                display = <TeamLabel teamCode={raw as string} />;
              } else {
                display = (raw as string) || "Não informado";
              }

              return (
                <div key={key} className="flex justify-between items-center py-1.5 border-b border-[#20293A]/60 gap-4">
                  <span className="text-xs text-slate-500 shrink-0">{LABELS[key]}</span>
                  <span className="text-sm text-slate-200 text-right">{display}</span>
                </div>
              );
            })}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
