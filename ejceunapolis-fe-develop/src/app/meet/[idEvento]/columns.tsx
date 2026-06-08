"use client";

import axios from 'axios';
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Copy, ExternalLink, Eye, Leaf, Pen, Pill, Trash2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Tipo ────────────────────────────────────────────────────────────────────
export type Meet = {
  idEncontrista: string;
  nomeCompleto: string;
  emailEncontrista: string;
  nomePreferido: string;
  whatsapp: string;
  nomePadrinho: string;
  cidade: string;
  logradouro: string;
  numero: string;
  bairro: string;
  estado: string;
  religiao: string;
  dataCriacao: string;
  statusPagamento: string;
  circulo: string;
  whatsappPadrinho: string;
  instagram: string;
  idPagamentoMp: string;
  idPagamento: string;
  alergicoMedicamentos: boolean;
  medicamentosAlergia: string;
  medicamentosEspecificos: string;
  possuiDietaEspecial: boolean;
  dietaEspecial: string;
  fotoUrl?: string;
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

function ToggleField({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
        checked
          ? "border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-[#C4B5FD]"
          : "border-[#20293A] bg-[#0B0F19] text-slate-400 hover:text-slate-200"
      }`}
    >
      <span>{label}</span>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? "border-[#7C5CFF] bg-[#7C5CFF]" : "border-slate-500"
      }`}>
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
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
export const columns: ColumnDef<Meet>[] = [
  { accessorKey: "nomeCompleto", header: "Nome Completo" },
  { accessorKey: "whatsapp", header: "Whatsapp" },
  { accessorKey: "nomePadrinho", header: "Padrinho" },
  {
    accessorKey: "circulo",
    header: "Círculo",
    cell: ({ row }) => {
      const colorMap: Record<string, string> = {
        VERMELHO: "bg-red-500",
        AZUL: "bg-blue-500",
        VERDE: "bg-green-500",
        AMARELO: "bg-yellow-500",
      };
      return <div className={`w-16 h-6 rounded ${colorMap[row.original.circulo] || "bg-gray-400"}`} />;
    },
  },
  {
    id: "saude",
    header: "Saúde",
    cell: ({ row }) => {
      const { alergicoMedicamentos, medicamentosAlergia, possuiDietaEspecial, dietaEspecial } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span
            title={alergicoMedicamentos
              ? `Alergia: ${medicamentosAlergia || "informada"}`
              : "Sem alergia a medicamentos"}
            className="cursor-default"
          >
            <Pill className={`w-4 h-4 ${alergicoMedicamentos ? "text-rose-400" : "text-slate-700"}`} />
          </span>
          <span
            title={possuiDietaEspecial
              ? `Dieta: ${dietaEspecial || "informada"}`
              : "Sem restrição alimentar"}
            className="cursor-default"
          >
            <Leaf className={`w-4 h-4 ${possuiDietaEspecial ? "text-amber-400" : "text-slate-700"}`} />
          </span>
        </div>
      );
    },
  },
  { accessorKey: "statusPagamento", header: "Pagamento" },
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
  { id: "actions", header: "Ações", cell: ({ row }) => <Actions encontrista={row.original} /> },
];

// ─── Actions ─────────────────────────────────────────────────────────────────
const Actions = ({ encontrista }: { encontrista: Meet }) => (
  <div className="flex space-x-2">
    <EditEncontrista encontrista={encontrista} />
    <DeleteEncontrista encontrista={encontrista} />
    <ViewEncontrista encontrista={encontrista} />
  </div>
);

// ─── Excluir ──────────────────────────────────────────────────────────────────
const DeleteEncontrista = ({ encontrista }: { encontrista: Meet }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/ejceunapolis/api/encontrista/${encontrista.idEncontrista}`);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao excluir encontrista:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="bg-red-500 text-white" title="Excluir">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Tem certeza de que deseja excluir <strong className="text-slate-200">{encontrista.nomeCompleto}</strong>? Esta ação não pode ser desfeita.
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
const EditEncontrista = ({ encontrista }: { encontrista: Meet }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"edit" | "info">("edit");
  const [formData, setFormData] = useState({ ...encontrista });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setFormData({ ...encontrista }); }, [encontrista]);

  const set = (field: keyof Meet, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/ejceunapolis/api/encontrista/${encontrista.idEncontrista}`,
        formData,
        { headers: { Accept: "*/*", "Content-Type": "application/json" } }
      );
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar encontrista:", error);
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
            <DialogTitle>{encontrista.nomeCompleto}</DialogTitle>
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
                  <Field label="Como prefere ser chamado(a)">
                    <Input value={formData.nomePreferido} onChange={(e) => set("nomePreferido", e.target.value)} />
                  </Field>
                  <Field label="E-mail">
                    <Input value={formData.emailEncontrista} onChange={(e) => set("emailEncontrista", e.target.value)} />
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

              <Section title="Padrinho / Madrinha">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nome">
                    <Input value={formData.nomePadrinho} onChange={(e) => set("nomePadrinho", e.target.value)} />
                  </Field>
                  <Field label="WhatsApp">
                    <Input value={formData.whatsappPadrinho} onChange={(e) => set("whatsappPadrinho", e.target.value)} />
                  </Field>
                </div>
              </Section>

              <Section title="Saúde">
                <div className="space-y-3">
                  <ToggleField
                    label="Alérgico(a) a medicamentos"
                    checked={formData.alergicoMedicamentos}
                    onChange={(v) => set("alergicoMedicamentos", v)}
                  />
                  {formData.alergicoMedicamentos && (
                    <div className="pl-3 border-l-2 border-rose-500/30 space-y-3">
                      <Field label="Medicamentos com alergia">
                        <Input value={formData.medicamentosAlergia} onChange={(e) => set("medicamentosAlergia", e.target.value)} />
                      </Field>
                      <Field label="Medicamentos de uso contínuo">
                        <Input value={formData.medicamentosEspecificos} onChange={(e) => set("medicamentosEspecificos", e.target.value)} />
                      </Field>
                    </div>
                  )}
                  <ToggleField
                    label="Possui dieta especial"
                    checked={formData.possuiDietaEspecial}
                    onChange={(v) => set("possuiDietaEspecial", v)}
                  />
                  {formData.possuiDietaEspecial && (
                    <div className="pl-3 border-l-2 border-amber-500/30">
                      <Field label="Descreva a dieta">
                        <Input value={formData.dietaEspecial} onChange={(e) => set("dietaEspecial", e.target.value)} />
                      </Field>
                    </div>
                  )}
                </div>
              </Section>

              <Section title="Evento">
                <Field label="Círculo">
                  <select
                    value={formData.circulo}
                    onChange={(e) => set("circulo", e.target.value)}
                    className="w-full h-10 rounded-md border border-[#20293A] bg-[#0B0F19] text-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
                  >
                    <option value="">Selecione...</option>
                    <option value="AZUL">🔵 Azul</option>
                    <option value="VERMELHO">🔴 Vermelho</option>
                    <option value="VERDE">🟢 Verde</option>
                    <option value="AMARELO">🟡 Amarelo</option>
                  </select>
                </Field>
              </Section>
            </div>
          )}

          {/* ── Aba: Informações ── */}
          {tab === "info" && (
            <div className="space-y-3 mt-3">
              <InfoRow label="Status de pagamento" value={encontrista.statusPagamento || "—"} />
              <InfoRow
                label="Data de cadastro"
                value={new Date(encontrista.dataCriacao).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              />

              {encontrista.fotoUrl && (
                <div className="flex justify-between items-center py-2 border-b border-[#20293A]/60">
                  <span className="text-xs text-slate-500">Foto</span>
                  <a
                    href={encontrista.fotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#7C5CFF] hover:underline"
                  >
                    Ver foto <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <CopyableId label="ID Pagamento" value={encontrista.idPagamento} />
                {encontrista.idPagamentoMp && (
                  <CopyableId label="Nº Transação (Mercado Pago)" value={encontrista.idPagamentoMp} />
                )}
              </div>

              <div className="h-px bg-[#20293A] my-1" />
              <CopyableId label="ID do Encontrista" value={encontrista.idEncontrista} />
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
const ViewEncontrista = ({ encontrista }: { encontrista: Meet }) => {
  const [open, setOpen] = useState(false);

  const LABELS: Partial<Record<keyof Meet, string>> = {
    nomeCompleto: "Nome completo",
    nomePreferido: "Como prefere ser chamado(a)",
    emailEncontrista: "E-mail",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    religiao: "Religião",
    nomePadrinho: "Padrinho / Madrinha",
    whatsappPadrinho: "WhatsApp do padrinho",
    logradouro: "Logradouro",
    numero: "Número",
    bairro: "Bairro",
    cidade: "Cidade",
    estado: "Estado",
    circulo: "Círculo",
    alergicoMedicamentos: "Alérgico a medicamentos",
    medicamentosAlergia: "Medicamentos com alergia",
    medicamentosEspecificos: "Medicamentos de uso contínuo",
    possuiDietaEspecial: "Possui dieta especial",
    dietaEspecial: "Dieta especial",
    statusPagamento: "Status de pagamento",
    dataCriacao: "Data de cadastro",
    idPagamento: "ID Pagamento",
    idPagamentoMp: "Nº Transação (MP)",
    idEncontrista: "ID do Encontrista",
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)} className="text-white" title="Visualizar">
        <Eye className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Detalhes — {encontrista.nomeCompleto}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {(Object.keys(LABELS) as Array<keyof Meet>).map((key) => {
              if (key === "fotoUrl") return null;
              const raw = encontrista[key];
              let display: string;
              if (key === "dataCriacao") {
                display = new Date(raw as string).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
              } else if (typeof raw === "boolean") {
                display = raw ? "Sim" : "Não";
              } else {
                display = (raw as string) || "Não informado";
              }
              return (
                <div key={key} className="flex justify-between items-start py-1.5 border-b border-[#20293A]/60 gap-4">
                  <span className="text-xs text-slate-500 shrink-0">{LABELS[key]}</span>
                  <span className="text-sm text-slate-200 text-right">{display}</span>
                </div>
              );
            })}

            {encontrista.fotoUrl && (
              <div className="flex justify-between items-center py-1.5 border-b border-[#20293A]/60 gap-4">
                <span className="text-xs text-slate-500 shrink-0">Foto</span>
                <a
                  href={encontrista.fotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#7C5CFF] hover:underline"
                >
                  Ver foto <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
