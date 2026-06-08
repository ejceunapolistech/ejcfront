"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Encounters, columns } from "./columns"
import { DataTable } from "./data-table"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import TeamLabel from "@/components/team/team-label"
import { getTeamInfo } from "@/constants/team-icons"

const EQUIPE_FRENTE = ["Bandinha", "Boa Vontade", "Biscoito", "Sociodrama", "Trânsito", "Não Optar", "Garçons"];
const EQUIPE_FUNDO = ["Oração", "Ordem", "Mídia", "Recepção", "Cozinha", "Círculo", "Secretaria", "Apoio", "Cerimonial", "Roteiro", "Refeitório", "Não Optar"];
const STATUS_OPTIONS = ["Aprovado", "Pendente", "NÃO PAGO"];

export default function DemoPage() {
  const params = useParams();
  const [data, setData] = useState<Encounters[]>([]);
  const idEvento = params?.idEvento as string;
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [filterFrente, setFilterFrente] = useState("");
  const [filterFundo, setFilterFundo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const statusPagamentoTraduzido: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    cancelled: "Cancelado",
  };

  const filteredData = data.filter((meet) => {
    const matchText =
      !filter ||
      meet.nomeCompleto?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.equipeFrente1?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.equipeFundo1?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.statusPagamento?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.idPagamentoMp?.toLowerCase().includes(filter.toLowerCase());

    const matchFrente =
      !filterFrente ||
      meet.equipeFrente1 === filterFrente ||
      meet.equipeFrente2 === filterFrente;

    const matchFundo =
      !filterFundo ||
      meet.equipeFundo1 === filterFundo ||
      meet.equipeFundo2 === filterFundo;

    const matchStatus =
      !filterStatus ||
      meet.statusPagamento?.toLowerCase() === filterStatus.toLowerCase();

    return matchText && matchFrente && matchFundo && matchStatus;
  });

  const getFilterMessage = () => {
    if (!filter) return `Total de encontreiro cadastrados: ${data.length}`;
  
    const byName = data.filter((meet) =>
      meet.nomeCompleto?.toLowerCase().includes(filter.toLowerCase())
    );
    const byEquipeFrente = data.filter((meet) =>
      meet.equipeFrente1?.toLowerCase().includes(filter.toLowerCase())
    );
    const byEquipeFundo = data.filter((meet) =>
      meet.equipeFundo1?.toLowerCase().includes(filter.toLowerCase())
    );
    const byStatusPagamento = data.filter((meet) =>
      meet.statusPagamento?.toLowerCase().includes(filter.toLowerCase())
    );
  
    if (byName.length > 0) {
      return `Tem ${byName.length} encontreiro(s) com o nome "${filter}" cadastrado(s).`;
    } else if (byEquipeFrente.length > 0) {
      return `Tem ${byEquipeFrente.length} encontreiro(s) na equipe de frente "${filter}" cadastrado(s).`;
    } else if (byEquipeFundo.length > 0) {
      return `Tem ${byEquipeFundo.length} encontreiro(s) na equipe de fundo "${filter}" cadastrado(s).`;
    } else if (byStatusPagamento.length > 0) {
      return `Tem ${byStatusPagamento.length} encontreiro(s) com pagamento "${filter}" cadastrado(s).`;
    } else {
      return `Nenhum encontreiro encontrado para o filtro "${filter}".`;
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${API_BASE_URL}/ejceunapolis/api/encontreiro/${idEvento}/listar-todos`); 
        const formattedData: Encounters[] = response.data.map((item: any) => ({
          id: item.idEncontreiro,
          nomeCompleto: item.nomeCompleto,
          emailEncontreiro: item.emailEncontreiro,
          whatsapp: item.whatsapp,
          cidade: item.cidade,
          logradouro: item.logradouro,
          numero: item.numero,
          bairro: item.bairro,
          estado: item.estado,
          religiao: item.religiao,
          idPagamento: item.idPagamento,
          equipeFrente1:  item.equipeFrente1,
          equipeFrente2:  item.equipeFrente2,
          equipeFundo1:  item.equipeFundo1,
          equipeFundo2:  item.equipeFundo2,
          idPagamentoMp: item.idPagamentoMp,
          dataCriacao: item.dataCriacao,
          statusPagamento: statusPagamentoTraduzido[item.statusPagamento] || item.statusPagamento,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Erro ao buscar encontreiro:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = [ "Nome Completo", "Email", "WhatsApp", "Cidade", "Logradouro","Numero","Bairro","Estado","Religiao","Equipe de frente","Equipe de fundo", "Pagamento", "Numero da transação", "dataCriacao"];
    csvRows.push(headers.join(";"));

    filteredData.forEach((meet) => {
      const row = [
        meet.nomeCompleto,
        meet.emailEncontreiro,
        meet.whatsapp,
        meet.cidade,
        meet.logradouro,
        meet.numero,
        meet.bairro,
        meet.estado,
        meet.religiao,
        meet.equipeFrente1,
        meet.equipeFundo1,
        meet.statusPagamento,
        meet.idPagamentoMp,
        meet.dataCriacao
      ].join(";");
      csvRows.push(row);
    });
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encontreiros.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">Lista de Encontreiros</h1>
        <span className="text-sm text-slate-400">Abaixo consta os encontreiros cadastrados</span>
      </div>
      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : (
        <>
        {/* ── Barra de filtros ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">

          {/* Busca por nome */}
          <Input
            type="text"
            placeholder="Buscar por nome..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-48 bg-[#0B0F19] border-[#20293A] text-slate-50 placeholder:text-slate-500 focus-visible:ring-[#7C5CFF] text-sm"
          />

          {/* Filtro Equipe de Frente */}
          <Select
            value={filterFrente || "_all"}
            onValueChange={(v) => setFilterFrente(v === "_all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[175px] text-sm">
              <SelectValue>
                {filterFrente
                  ? <TeamLabel teamCode={filterFrente} size={13} />
                  : <span className="text-slate-400">Equipe de Frente</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">
                <span className="text-slate-400">Todas as frentes</span>
              </SelectItem>
              {EQUIPE_FRENTE.map((e) => {
                const info = getTeamInfo(e);
                const Icon = info?.icon;
                return (
                  <SelectItem key={e} value={e}>
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon size={13} className="opacity-75 shrink-0" />}
                      {e}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Filtro Equipe de Fundo */}
          <Select
            value={filterFundo || "_all"}
            onValueChange={(v) => setFilterFundo(v === "_all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[175px] text-sm">
              <SelectValue>
                {filterFundo
                  ? <TeamLabel teamCode={filterFundo} size={13} />
                  : <span className="text-slate-400">Equipe de Fundo</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">
                <span className="text-slate-400">Todos os fundos</span>
              </SelectItem>
              {EQUIPE_FUNDO.map((e) => {
                const info = getTeamInfo(e);
                const Icon = info?.icon;
                return (
                  <SelectItem key={e} value={e}>
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon size={13} className="opacity-75 shrink-0" />}
                      {e}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-[#20293A] bg-[#0B0F19] text-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] w-[145px]"
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Limpar filtros */}
          {(filterFrente || filterFundo || filterStatus) && (
            <button
              onClick={() => { setFilterFrente(""); setFilterFundo(""); setFilterStatus(""); }}
              className="h-9 px-3 text-xs text-slate-400 hover:text-slate-200 border border-[#20293A] rounded-md hover:border-[#7C5CFF]/40 transition-colors"
            >
              Limpar filtros
            </button>
          )}

          <Button
            onClick={exportToCSV}
            className="h-9 ml-auto border border-[#7C5CFF]/50 bg-transparent text-slate-100 hover:bg-[#7C5CFF]/10 rounded-xl gap-2 text-sm"
          >
            Exportar CSV
          </Button>
        </div>

        <p className="text-sm text-slate-500 mb-3">
          Exibindo <span className="text-[#7C5CFF] font-semibold">{filteredData.length}</span> de <span className="font-semibold">{data.length}</span> encontreiros
        </p>
        <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  )
}
