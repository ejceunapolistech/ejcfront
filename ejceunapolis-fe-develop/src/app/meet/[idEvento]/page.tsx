'use client';
import { Sidebar } from "@/components/sidebar";
import { Meet, columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams } from "next/navigation";
import { Leaf, Pill } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CIRCULOS = ["AZUL", "VERMELHO", "VERDE", "AMARELO"];
const STATUS_OPTIONS = ["Aprovado", "Pendente", "NÃO PAGO"];

const CIRCULO_DOT: Record<string, string> = {
  AZUL:     "bg-blue-500",
  VERMELHO: "bg-red-500",
  VERDE:    "bg-green-500",
  AMARELO:  "bg-yellow-400",
};

export default function DemoPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [filterCirculo, setFilterCirculo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAlergia, setFilterAlergia] = useState(false);
  const [filterDieta, setFilterDieta] = useState(false);
  const idEvento = params?.idEvento as string;
  const [data, setData] = useState<Meet[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const statusPagamentoTraduzido: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
  };

  const filteredData = data.filter((meet) => {
    const matchText =
      !filter ||
      meet.nomeCompleto?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.idPagamentoMp?.toLowerCase().includes(filter.toLowerCase()) ||
      meet.nomePadrinho?.toLowerCase().includes(filter.toLowerCase());

    const matchCirculo =
      !filterCirculo || meet.circulo === filterCirculo;

    const matchStatus =
      !filterStatus ||
      meet.statusPagamento?.toLowerCase() === filterStatus.toLowerCase();

    const matchAlergia = !filterAlergia || meet.alergicoMedicamentos === true;
    const matchDieta = !filterDieta || meet.possuiDietaEspecial === true;

    return matchText && matchCirculo && matchStatus && matchAlergia && matchDieta;
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${API_BASE_URL}/ejceunapolis/api/encontrista/${idEvento}/listar-todos`); 
        const formattedData: Meet[] = response.data.map((item: any) => ({
          idEncontrista: item.idEncontrista,
          nomeCompleto: item.nomeCompleto,
          nomePreferido: item.nomePreferido,
          emailEncontrista: item.emailEncontrista,
          whatsapp: item.whatsapp,
          cidade: item.cidade,
          logradouro: item.logradouro,
          numero: item.numero,
          bairro: item.bairro,
          estado: item.estado,
          religiao: item.religiao,
          circulo: item.circulo,
          nomePadrinho:  item.nomePadrinho,
          whatsappPadrinho: item.whatsappPadrinho,
          idPagamentoMp: item.idPagamentoMp,
          dataCriacao:item.dataCriacao,
          statusPagamento: statusPagamentoTraduzido[item.statusPagamento] || item.statusPagamento,
          alergicoMedicamentos: item.alergicoMedicamentos,
          medicamentosAlergia: item.medicamentosAlergia,
          medicamentosEspecificos: item.medicamentosEspecificos,
          possuiDietaEspecial: item.possuiDietaEspecial,
          dietaEspecial: item.dietaEspecial,
          fotoUrl: item.fotoUrl,
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
    const headers = [
      "ID", 
      "Nome Completo", 
      "Nome Preferido", 
      "Padrinho",
      "WhatsApp do padrinho", 
      "WhatsApp","Cidade", 
      "Logradouro",
      "Numero",
      "Bairro",
      "Estado",
      "Religiao",
      "Alergico Medicamentos",
      "Medicamentos Alergia",
      "Medicamentos Especificos",
      "Possui dieta especial",
      "Dieta especial",
      "Circulo",
      "Status Pagamento", 
      "Transação", 
      "Data de criação"];
    csvRows.push(headers.join(";"));

    filteredData.forEach((meet) => {
      const row = [
        meet.idEncontrista,
        meet.nomeCompleto,
        meet.nomePreferido,
        meet.nomePadrinho,
        meet.whatsappPadrinho,
        meet.whatsapp,
        meet.cidade,
        meet.logradouro,
        meet.numero,
        meet.bairro,
        meet.estado,
        meet.religiao,
        meet.alergicoMedicamentos !== undefined
        ? (meet.alergicoMedicamentos ? "Sim" : "Não")
        : "Não informado",
      meet.medicamentosAlergia?.trim()
        ? meet.medicamentosAlergia
        : "Não possui medicamentos com alergia informados",
      meet.medicamentosEspecificos?.trim()
        ? meet.medicamentosEspecificos
        : "Não possui medicamentos específicos informados",
      meet.possuiDietaEspecial !== undefined
        ? (meet.possuiDietaEspecial ? "Sim" : "Não")
        : "Não informado",
      meet.dietaEspecial?.trim()
        ? meet.dietaEspecial
        : "Não possui dieta especial informada",
        meet.circulo,
        meet.statusPagamento,
        meet.idPagamentoMp,
        meet.dataCriacao,
      ].join(";");
      csvRows.push(row);
    });
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encontristas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar/>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">Lista de Encontristas</h1>
        <span className="text-sm text-slate-400">Segue lista de todos os encontristas cadastrados.</span>
      </div>
      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : (
        <>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Input
            type="text"
            placeholder="Filtrar por nome ou padrinho"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 w-64 bg-[#0B0F19] border-[#20293A] text-slate-50 placeholder:text-slate-500 focus-visible:ring-[#7C5CFF]"
          />

          {/* Filtro por Círculo */}
          <Select value={filterCirculo || "_all"} onValueChange={(v) => setFilterCirculo(v === "_all" ? "" : v)}>
            <SelectTrigger className="h-10 w-[160px] text-sm rounded-xl">
              <SelectValue>
                {filterCirculo ? (
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${CIRCULO_DOT[filterCirculo]}`} />
                    {filterCirculo.charAt(0) + filterCirculo.slice(1).toLowerCase()}
                  </span>
                ) : (
                  <span className="text-slate-400">Círculos</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">
                <span className="text-slate-400">Todos os círculos</span>
              </SelectItem>
              {CIRCULOS.map((c) => (
                <SelectItem key={c} value={c}>
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${CIRCULO_DOT[c]}`} />
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border border-[#20293A] bg-[#0B0F19] text-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] min-w-[160px]"
          >
            <option value="">Status pagamento</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Filtros de saúde */}
          <button
            onClick={() => setFilterAlergia(!filterAlergia)}
            title="Filtrar com alergia a medicamentos"
            className={`h-10 inline-flex items-center gap-1.5 px-3 rounded-xl border text-sm transition-all ${
              filterAlergia
                ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                : "border-[#20293A] bg-[#0B0F19] text-slate-500 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            <Pill className="w-4 h-4" />
            Alergia
          </button>

          <button
            onClick={() => setFilterDieta(!filterDieta)}
            title="Filtrar com restrição alimentar"
            className={`h-10 inline-flex items-center gap-1.5 px-3 rounded-xl border text-sm transition-all ${
              filterDieta
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "border-[#20293A] bg-[#0B0F19] text-slate-500 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            <Leaf className="w-4 h-4" />
            Dieta
          </button>

          {/* Badges de filtros ativos */}
          {(filterCirculo || filterStatus) && (
            <div className="flex items-center gap-2">
              {filterCirculo && (
                <span className="flex items-center gap-1.5 text-xs bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/25 px-2 py-1 rounded-full">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CIRCULO_DOT[filterCirculo]}`} />
                  {filterCirculo.charAt(0) + filterCirculo.slice(1).toLowerCase()}
                  <button onClick={() => setFilterCirculo("")} className="ml-0.5 hover:text-white">×</button>
                </span>
              )}
              {filterStatus && (
                <span className="flex items-center gap-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("")} className="ml-1 hover:text-white">×</button>
                </span>
              )}
            </div>
          )}

          <Button onClick={exportToCSV} className="border border-[#7C5CFF]/50 bg-transparent text-slate-100 hover:bg-[#7C5CFF]/10 rounded-xl gap-2 ml-auto">
            Exportar CSV
          </Button>
        </div>

        <p className="text-sm text-slate-500 mb-3">
          Exibindo <span className="text-[#7C5CFF] font-semibold">{filteredData.length}</span> de <span className="font-semibold">{data.length}</span> encontristas
        </p>
        <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}