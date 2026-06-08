"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EventData {
  nomeEvento: string;
  vagasEncontristas: number;
  vagasEncontreiro: number;
  valorEncontreiro: number;
  valorEncontrista: number;
}

export default function Configure() {
  const params = useParams();
  const router = useRouter();
  const idEvento = params?.idEvento as string;
  const [evento, setEvento] = useState<EventData>({
    nomeEvento: "",
    vagasEncontristas: 0,
    vagasEncontreiro: 0,
    valorEncontreiro: 0,
    valorEncontrista: 0,
  });
  const [originalEvento, setOriginalEvento] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Buscar dados do evento ao carregar a página
  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado.");
        return router.push("/");
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/evento/${idEvento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvento(response.data);
        setOriginalEvento(response.data);
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
        console.error("Erro ao carregar evento.");
      }
    };

    if (idEvento) {
      fetchEvent();
    }
  }, [idEvento, router]);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuário não autenticado.");
      return router.push("/");
    }
  
    try {
      await axios.delete(`${API_BASE_URL}/ejceunapolis/api/evento/${idEvento}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Evento deletado com sucesso!");
      router.push("/events");
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      alert("Erro ao deletar evento. Tente novamente.");
    }
  };
  

  const isModified = JSON.stringify(evento) !== JSON.stringify(originalEvento);
  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const idUsuario = localStorage.getItem("idUsuario");

    if (!token || !idUsuario) {
      console.error("Usuário não autenticado.");
      setLoading(false);
      return router.push("/");
    }

    try {
      await axios.put(
        `${API_BASE_URL}/ejceunapolis/api/evento/${idEvento}`,
        {
          ...evento,
          idUsuario: idUsuario,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Evento atualizado com sucesso!");
      setOriginalEvento(evento);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      console.error("Erro ao atualizar evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 text-slate-50">Configurações do Evento</h1>
        <p className="text-slate-400 text-sm">Abaixo segue informações sobre o evento que você cadastrou, você poderá editar essas informações.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mt-6">
          {[
            { label: "Nome do Evento", value: evento.nomeEvento, onChange: (v: string) => setEvento({ ...evento, nomeEvento: v }), type: "text" },
            { label: "Vagas para Encontristas", value: evento.vagasEncontristas, onChange: (v: string) => setEvento({ ...evento, vagasEncontristas: Number(v) }), type: "number" },
            { label: "Vagas para Encontreiros", value: evento.vagasEncontreiro, onChange: (v: string) => setEvento({ ...evento, vagasEncontreiro: Number(v) }), type: "number" },
            { label: "Valor para Encontreiros", value: evento.valorEncontreiro, onChange: (v: string) => setEvento({ ...evento, valorEncontreiro: Number(v) }), type: "number" },
            { label: "Valor para Encontristas", value: evento.valorEncontrista, onChange: (v: string) => setEvento({ ...evento, valorEncontrista: Number(v) }), type: "number" },
          ].map(({ label, value, onChange, type }) => (
            <div key={label}>
              <Label className="text-[#CBD5E1] text-sm">{label}</Label>
              <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 bg-[#0B0F19] border-[#20293A] text-[#F8FAFC] placeholder:text-[#526079] focus-visible:ring-[#7C5CFF] rounded-xl"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpdate}
          disabled={!isModified || loading}
          className="mt-6 bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white rounded-xl gap-2 disabled:opacity-40 transition-colors"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 max-w-2xl">
        <Label className="text-slate-300 text-sm">Gostaria de excluir o evento?</Label>
        <div className="mt-3">
          <Button
            onClick={handleDelete}
            className="border border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl gap-2"
          >
            Excluir Evento
          </Button>
        </div>
      </div>
    </div>
  );
}
