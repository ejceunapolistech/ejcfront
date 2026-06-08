'use client';
import { Sidebar } from "@/components/sidebar";
import { Transaction, columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = ["Aprovado", "Pendente", "Cancelado"];

export default function TransacoesPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [idEvento, setIdEvento] = useState<string | null>(null);
  const [data, setData] = useState<Transaction[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const statusPagamentoTraduzido: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    cancelled: "Cancelado",
  };

  const filteredData = data.filter((t) => {
    const matchText =
      !filter ||
      t.nomePagador?.toLowerCase().includes(filter.toLowerCase()) ||
      t.emailPagador?.toLowerCase().includes(filter.toLowerCase()) ||
      t.idPagamentoMp?.toLowerCase().includes(filter.toLowerCase()) ||
      t.idPagamento?.toLowerCase().includes(filter.toLowerCase());

    const matchStatus =
      !filterStatus ||
      t.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchText && matchStatus;
  });

  useEffect(() => {
    const stored = localStorage.getItem("idEvento");
    if (stored) setIdEvento(stored);
  }, []);

  useEffect(() => {
    if (!idEvento) return;

    async function fetchData() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/pagamentos/${idEvento}/listar-todos`
        );
        const formattedData: Transaction[] = response.data.map((item: any) => ({
          idPagamento: item.idPagamento,
          idPagamentoMp: item.idPagamentoMp,
          emailPagador: item.emailPagador,
          nomePagador: item.nomePagador,
          tipoParticipante: item.tipoParticipante,
          valor: item.valor,
          observacao: item.observacao,
          dataCriacao: item.dataCriacao,
          status: statusPagamentoTraduzido[item.status] || item.status,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [idEvento]);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = [
      "ID", "Nº Transação MP", "Nome", "Tipo", "Email",
      "Status", "Valor", "Observação", "Data Criação",
    ];
    csvRows.push(headers.join(";"));

    filteredData.forEach((t) => {
      const row = [
        t.idPagamento,
        t.idPagamentoMp ?? "",
        t.nomePagador ?? "",
        t.tipoParticipante ?? "",
        t.emailPagador,
        t.status,
        t.valor,
        t.observacao ?? "",
        t.dataCriacao
          ? new Date(t.dataCriacao).toLocaleString("pt-BR")
          : "",
      ].join(";");
      csvRows.push(row);
    });

    const csvContent = "﻿" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transacoes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalAprovado = filteredData
    .filter((t) => t.status === "Aprovado")
    .reduce((sum, t) => sum + parseFloat(String(t.valor ?? 0)), 0);

  return (
    <div className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">Transações</h1>
        <span className="text-sm text-slate-400">Pagamentos do evento atual</span>
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: data.length, color: "text-slate-200" },
          {
            label: "Aprovados",
            value: data.filter((t) => t.status === "Aprovado").length,
            color: "text-green-400",
          },
          {
            label: "Pendentes",
            value: data.filter((t) => t.status === "Pendente").length,
            color: "text-yellow-400",
          },
          {
            label: "Arrecadado",
            value: `R$ ${totalAprovado.toFixed(2).replace(".", ",")}`,
            color: "text-[#C4B5FD]",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#101624] border border-[#20293A] rounded-xl px-4 py-3 space-y-1"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Buscar por nome, email ou ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 w-64 bg-[#0B0F19] border-[#20293A] text-slate-50 placeholder:text-slate-500 focus-visible:ring-[#7C5CFF] text-sm"
            />

            <Select
              value={filterStatus || "_all"}
              onValueChange={(v) => setFilterStatus(v === "_all" ? "" : v)}
            >
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue>
                  {filterStatus
                    ? filterStatus
                    : <span className="text-slate-400">Status pagamento</span>}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">
                  <span className="text-slate-400">Todos os status</span>
                </SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterStatus && (
              <button
                onClick={() => setFilterStatus("")}
                className="h-9 px-3 text-xs text-slate-400 hover:text-slate-200 border border-[#20293A] rounded-md hover:border-[#7C5CFF]/40 transition-colors"
              >
                Limpar
              </button>
            )}

            <p className="text-sm text-slate-500 ml-1">
              Exibindo <span className="text-[#7C5CFF] font-semibold">{filteredData.length}</span> de{" "}
              <span className="font-semibold">{data.length}</span>
            </p>

            <Button
              onClick={exportToCSV}
              className="h-9 ml-auto border border-[#7C5CFF]/50 bg-transparent text-slate-100 hover:bg-[#7C5CFF]/10 rounded-xl gap-2 text-sm"
            >
              Exportar CSV
            </Button>
          </div>

          <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}
