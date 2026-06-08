import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { useRouter } from "next/navigation";

interface PagamentoDialogProps {
  idEvento: string;
  idEncontrista: string;
}

interface PagamentoResponse {
  idPagamento: string;
  status: string;
  valor: number;
  qrCode: string;
  pixCopiaECola: string;
}

export function PagamentoDialogEncontrista({ idEvento, idEncontrista }: PagamentoDialogProps) {
  const [dadosPagamento, setDadosPagamento] = useState<PagamentoResponse | null>(null);
  const router = useRouter();
  const [progresso, setProgresso] = useState(0);
  const [statusPagamento, setStatusPagamento] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const copiarCodigoPix = () => {
    if (dadosPagamento?.pixCopiaECola) {
      navigator.clipboard.writeText(dadosPagamento.pixCopiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  useEffect(() => {
    const gerarQrCode = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/ejceunapolis/api/pagamentos/pix`, {
          idEvento,
          idEncontrista
        });
        setDadosPagamento(response.data);
        setStatusPagamento(response.data.status);
      } catch (error) {
        console.error("Erro ao gerar pagamento", error);
      }
    };
    gerarQrCode();
  }, [idEvento, idEncontrista]);

  useEffect(() => {
    const verificarPagamento = async () => {
      try {
        if (dadosPagamento?.idPagamento) {
          const response = await axios.get(`${API_BASE_URL}/ejceunapolis/api/pagamentos/${dadosPagamento.idPagamento}`);
          setStatusPagamento(response.data.status);
          if (response.data.status === "approved") {
            router.push("/success");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento", error);
      }
    };
    const interval = setInterval(verificarPagamento, 5000);
    return () => clearInterval(interval);
  }, [dadosPagamento]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className=" col-span-2 text-center">Efetuar Pagamento</Button>
      </DialogTrigger>
      <DialogContent>
        {statusPagamento === "approved" ? (
          <div className="flex justify-center items-center h-32">
            <p className="bg-green-500 text-white p-4 rounded-lg text-xl">Pagamento efetuado com sucesso!</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pagamento</DialogTitle>
              <DialogDescription>Escaneie o QR Code ou copie o código Pix para pagar.</DialogDescription>
            </DialogHeader>
            {dadosPagamento?.qrCode && (
              <img src={`data:image/png;base64,${dadosPagamento.qrCode}`} alt="QR Code" className="my-4 w-48 h-48 mx-auto" />
            )}
            <p>PIX Copia e Cola:</p>
            <p className="break-all bg-gray-100 p-2 rounded" onClick={copiarCodigoPix}>{dadosPagamento?.pixCopiaECola}</p>
            {copiado && <p className="text-green-500">Código copiado!</p>}
            <Progress value={progresso} max={100} className="mt-4" />
            {statusPagamento === "pending" && <p className="bg-yellow-500 text-center text-slate-700 p-4 rounded-lg">Aguardando pagamento!</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
