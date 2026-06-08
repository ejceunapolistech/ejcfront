"use client";

import axios from "axios";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export type Transaction = {
  idPagamento: string;
  idPagamentoMp: string | null;
  status: string;
  emailPagador: string;
  nomePagador: string | null;
  tipoParticipante: string | null;
  valor: string;
  observacao: string | null;
  dataCriacao: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  Aprovado:  "bg-green-500/15 text-green-400 border border-green-500/30",
  Pendente:  "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Cancelado: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const TIPO_BADGE: Record<string, string> = {
  Encontreiro: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  Encontrista: "bg-[#7C5CFF]/15 text-[#C4B5FD] border border-[#7C5CFF]/30",
};

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "participante",
    header: "Participante",
    cell: ({ row }) => {
      const { nomePagador, emailPagador, tipoParticipante } = row.original;
      const tipoCss = TIPO_BADGE[tipoParticipante ?? ""] ?? "bg-slate-700/30 text-slate-400 border border-slate-600/30";
      return (
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-slate-200">{nomePagador || "—"}</p>
          <p className="text-xs text-slate-500">{emailPagador}</p>
          {tipoParticipante && (
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full ${tipoCss}`}>
              {tipoParticipante}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "transacao",
    header: "Transação",
    cell: ({ row }) => {
      const { idPagamento, idPagamentoMp } = row.original;
      return (
        <div className="space-y-0.5">
          <p className="text-xs text-slate-500 font-mono truncate max-w-[160px]" title={idPagamento}>
            {idPagamento}
          </p>
          {idPagamentoMp ? (
            <p className="text-xs text-green-400 font-mono truncate max-w-[160px]" title={idPagamentoMp}>
              MP: {idPagamentoMp}
            </p>
          ) : (
            <p className="text-xs text-yellow-500 italic">Aguardando MP...</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const css = STATUS_BADGE[status] ?? "bg-slate-600/15 text-slate-400 border border-slate-600/30";
      return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${css}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const v = parseFloat(String(row.original.valor ?? 0));
      return (
        <span className="text-sm font-semibold text-slate-200">
          R$ {v.toFixed(2).replace(".", ",")}
        </span>
      );
    },
  },
  {
    accessorKey: "dataCriacao",
    header: "Data",
    cell: ({ row }) => {
      const d = row.original.dataCriacao;
      if (!d) return <span className="text-slate-500 text-xs">—</span>;
      return (
        <span className="text-xs text-slate-400">
          {new Date(d).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "observacao",
    header: "Observação",
    cell: ({ row }) => {
      const obs = row.original.observacao;
      return obs
        ? <span className="text-xs text-slate-300">{obs}</span>
        : <span className="text-xs text-slate-600 italic">—</span>;
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <Actions transacao={row.original} />,
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Actions = ({ transacao }: { transacao: Transaction }) => (
  <div className="flex gap-2">
    <EditarTransacao transacao={transacao} />
    <DeletarTransacao transacao={transacao} />
  </div>
);

// ─── Editar ───────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["pending", "approved", "cancelled"];
const STATUS_PT: Record<string, string> = {
  pending: "Pendente", approved: "Aprovado", cancelled: "Cancelado",
};

const EditarTransacao = ({ transacao }: { transacao: Transaction }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const statusRaw = Object.entries(STATUS_PT).find(([, pt]) => pt === transacao.status)?.[0] ?? "pending";
  const [status, setStatus] = useState(statusRaw);
  const [idPagamentoMp, setIdPagamentoMp] = useState(transacao.idPagamentoMp ?? "");
  const [observacao, setObservacao] = useState(transacao.observacao ?? "");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/ejceunapolis/api/pagamentos/${transacao.idPagamento}`,
        { status, idPagamentoMp, observacao }
      );
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="bg-blue-500 text-white h-8 w-8 p-0" title="Editar">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-xs text-slate-500 font-mono truncate">
            {transacao.idPagamento}
          </DialogDescription>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-[#20293A] bg-[#0B0F19] text-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_PT[s]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">ID Pagamento (Mercado Pago)</label>
              <Input
                placeholder="Ex: 1234567890"
                value={idPagamentoMp}
                onChange={(e) => setIdPagamentoMp(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Observação</label>
              <Input
                placeholder="Observação interna..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={loading} className="bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Deletar ─────────────────────────────────────────────────────────────────
const DeletarTransacao = ({ transacao }: { transacao: Transaction }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/ejceunapolis/api/pagamentos/${transacao.idPagamento}`);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="bg-red-500 text-white h-8 w-8 p-0" title="Excluir">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Excluir pagamento de <strong className="text-slate-200">{transacao.nomePagador || transacao.emailPagador}</strong>?
            Esta ação não pode ser desfeita.
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
