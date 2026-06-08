"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle2, Clock, Copy, XCircle } from "lucide-react";

interface PagamentoResponse {
  idPagamento: string;
  status: string;
  valor: number;
  qrCode: string;
  pixCopiaECola: string;
  emailPagador: string;
}

const TIMEOUT_SEGUNDOS = 180;
const INTERVALO_VERIFICACAO = 5000;

export default function PagamentoEncontristaPage() {
  const [dadosPagamento, setDadosPagamento] = useState<PagamentoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [segundos, setSegundos] = useState(TIMEOUT_SEGUNDOS);
  const [statusPagamento, setStatusPagamento] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idEvento = params?.idEvento as string;
  const idEncontrista = searchParams.get("idEncontrista");

  const copiarCodigoPix = () => {
    if (dadosPagamento?.pixCopiaECola) {
      navigator.clipboard.writeText(dadosPagamento.pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  useEffect(() => {
    if (!idEvento || !idEncontrista) {
      setError("Parâmetros de pagamento não encontrados na URL.");
      setLoading(false);
      return;
    }

    const gerarQrCode = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/ejceunapolis/api/pagamentos/pix`,
          { idEvento, idEncontrista }
        );
        setDadosPagamento(response.data);
        setStatusPagamento(response.data.status);
      } catch (err) {
        setError("Erro ao gerar o pagamento. Tente novamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    gerarQrCode();
  }, [idEvento, idEncontrista]);

  // Regressivo + polling de status
  useEffect(() => {
    if (!dadosPagamento?.idPagamento) return;

    const timerInterval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    const verificarInterval = setInterval(async () => {
      if (segundos <= 0) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/pagamentos/${dadosPagamento.idPagamento}`
        );
        setStatusPagamento(res.data.status);
        if (res.data.status === "approved") {
          clearInterval(timerInterval);
          clearInterval(verificarInterval);
          router.push("/success");
        }
      } catch (err) {
        console.error("Erro ao verificar pagamento:", err);
      }
    }, INTERVALO_VERIFICACAO);

    return () => {
      clearInterval(timerInterval);
      clearInterval(verificarInterval);
    };
  }, [dadosPagamento]);

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const progressoPct = ((TIMEOUT_SEGUNDOS - segundos) / TIMEOUT_SEGUNDOS) * 100;
  const esgotado = segundos === 0 && statusPagamento !== "approved";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Gerando pagamento PIX...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center px-4">
        <div className="bg-[#101624] border border-red-500/30 rounded-2xl p-8 text-center max-w-sm space-y-3">
          <XCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-slate-200 font-medium">{error}</p>
          <p className="text-slate-500 text-sm">Feche esta aba e tente novamente pelo formulário de inscrição.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">

        {/* Aviso */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-center">
          <p className="text-amber-400 text-sm font-medium">
            Não feche ou atualize esta página até a confirmação do pagamento.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-[#101624] border border-[#20293A] rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-50">Pagamento da inscrição</h1>
            <p className="text-2xl font-bold text-[#C4B5FD] mt-1">
              R$ {dadosPagamento?.valor.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {/* QR Code */}
          {dadosPagamento?.qrCode && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${dadosPagamento.qrCode}`}
                alt="QR Code PIX"
                className="w-44 h-44 rounded-xl border border-[#20293A]"
              />
            </div>
          )}

          {/* PIX Copia e Cola */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 text-center">PIX Copia e Cola</p>
            <div
              onClick={copiarCodigoPix}
              className="bg-[#0B0F19] border border-[#20293A] rounded-xl px-3 py-2.5 cursor-pointer hover:border-[#7C5CFF]/40 transition-colors"
            >
              <p className="text-xs text-slate-400 break-all font-mono line-clamp-3">
                {dadosPagamento?.pixCopiaECola}
              </p>
            </div>
            <button
              onClick={copiarCodigoPix}
              className={`w-full flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all ${
                copiado
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : "border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-[#C4B5FD] hover:bg-[#7C5CFF]/20"
              }`}
            >
              {copiado ? (
                <><CheckCircle2 className="w-4 h-4" /> Copiado!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copiar código PIX</>
              )}
            </button>
          </div>

          {/* Timer + barra */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Tempo restante
              </span>
              <span className={`font-mono font-semibold ${esgotado ? "text-red-400" : "text-slate-300"}`}>
                {minutos.toString().padStart(2, "0")}:{segs.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="h-1.5 bg-[#20293A] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${esgotado ? "bg-red-500" : "bg-[#7C5CFF]"}`}
                style={{ width: `${progressoPct}%` }}
              />
            </div>
          </div>

          {/* Status */}
          {statusPagamento === "pending" && !esgotado && (
            <p className="text-center text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-2">
              Aguardando confirmação do pagamento...
            </p>
          )}
          {statusPagamento === "approved" && (
            <p className="text-center text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg py-2 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Pagamento aprovado! Redirecionando...
            </p>
          )}
          {esgotado && (
            <p className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2">
              Tempo esgotado. Se já pagou, aguarde o processamento ou entre em contato.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
