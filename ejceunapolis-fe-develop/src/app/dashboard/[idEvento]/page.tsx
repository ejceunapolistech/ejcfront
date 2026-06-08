"use client";
import EncountersList from "@/components/encounters-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EncounterList from "@/components/encounter-list";
import { Progress } from "@/components/ui/progress";

interface EventData {
  idEvento: string;
  nomeEvento: string;
  vagasEncontreiro: number;
  vagasEncontristas: number;
}

interface Encontreiro {
  idEncontreiro: string;
  nomeCompleto: string;
  icon: string;
  dataCriacao: string;
  statusPagamento: string;
}

interface Encontristas {
  idEncontrista: string;
  nomeCompleto: string;
  icon: string;
  nomePadrinho: string;
  dataCriacao: string;
  statusPagamento: string;
}

export default function DashboardEvento() {
  const params = useParams(); 
  const idEvento = params?.idEvento as string;
  const [evento, setEvento] = useState<EventData | null>(null);
  const [encontreiros, setEncontreiros] = useState<Encontreiro[]>([]);
  const [encontristas, setEncontristas] = useState<Encontristas[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (idEvento) {
      localStorage.setItem("idEvento", idEvento);
    }
  }, [idEvento]);
  
  useEffect(() => {
    async function fetchEvento() {
      const token = localStorage.getItem("token");
      if (!idEvento || !token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/ejceunapolis/api/evento/${idEvento}`, {
          timeout: 1000,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        setEvento(response.data);
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchEncontreiros() {
      const token = localStorage.getItem("token");
      if (!idEvento || !token) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/encontreiro/${idEvento}/ultimos?quantidade=5`,
          {
            headers: {
              "accept": "*/*",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data.map((encontreiro: { idEncontreiro: string; nomeCompleto: string; dataCriacao: string; statusPagamento: string; }) => {
          const [firstName, lastName] = encontreiro.nomeCompleto.split(" ");
          return {
            id: encontreiro.idEncontreiro,
            nomeCompleto: encontreiro.nomeCompleto,
            icon: `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase(),
            dataCriacao: encontreiro.dataCriacao,
            statusPagamento: encontreiro.statusPagamento,
          };
        });
        
        setEncontreiros(data);
      } catch (error) {
        console.error("Erro ao buscar encontreiros:", error);
      }
    }

    async function fetchEncontristas() {
      const token = localStorage.getItem("token");
      if (!idEvento || !token) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/encontrista/${idEvento}/ultimos?quantidade=5`,
          {
            headers: {
              "accept": "*/*",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        
        const data = response.data.map((encontrista: { idEncontrista: string; nomeCompleto: string; dataCriacao: string; nomePadrinho: string; statusPagamento: string; }) => {
          const [firstName, lastName] = encontrista.nomeCompleto.split(" ");
          return {
            id: encontrista.idEncontrista,
            nomeCompleto: encontrista.nomeCompleto,
            icon: `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase(),
            nomePadrinho: encontrista.nomePadrinho,
            dataCriacao: encontrista.dataCriacao,
            statusPagamento: encontrista.statusPagamento
          };
        });
        
        setEncontristas(data);
      } catch (error) {
        console.error("Erro ao buscar encontreiros:", error);
      }
    }

    fetchEvento();
    fetchEncontreiros();
    fetchEncontristas();
  }, [idEvento]);

  if (!evento) return <p className="flex justify-center items-center">Evento não encontrado.</p>;

  return (
    <main className="sm:ml-14 p-6 min-h-screen bg-[#080B12]">
      <Sidebar/>
      <h1 className="text-2xl font-bold mb-1 text-[#F8FAFC] tracking-tight">
        Bem-vindo ao evento <span className="text-[#7C5CFF]">{evento.nomeEvento}</span>
      </h1>
      <span className="text-sm text-[#7C8AA5]">
        Aqui você pode gerenciar os participantes e detalhes do evento.
      </span>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <Card className="rounded-2xl border border-[#20293A] bg-[#101624] shadow-lg shadow-black/20 hover:border-[#7C5CFF]/25 hover:bg-[#121A2A] transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-base text-[#F8FAFC] font-semibold select-none">Encontristas</CardTitle>
            <CardDescription className="text-[#7C8AA5]">Total de vagas disponíveis para encontristas</CardDescription>
          </CardHeader>
          <CardContent>
            <h1 className="text-4xl font-bold text-[#F6C453]">{evento.vagasEncontristas}</h1>
            <p className="text-[#7C8AA5] text-sm">disponíveis</p>
            <div className="mt-4">
              <Link href={evento.vagasEncontristas > 0 ? `/form-encounters/${idEvento}` : "#"} passHref target="_blank">
                <Button disabled={evento.vagasEncontristas === 0} className="mt-2 w-full sm:w-auto border border-[#7C5CFF]/50 bg-transparent text-[#CBD5E1] hover:bg-[#7C5CFF]/10 hover:border-[#7C5CFF]/70 rounded-xl transition-colors">
                  Cadastrar encontristas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#20293A] bg-[#101624] shadow-lg shadow-black/20 hover:border-[#7C5CFF]/25 hover:bg-[#121A2A] transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-base text-[#F8FAFC] font-semibold select-none">Encontreiros</CardTitle>
            <CardDescription className="text-[#7C8AA5]">Total de vagas disponíveis para encontreiros</CardDescription>
          </CardHeader>
          <CardContent>
            <h1 className="text-4xl font-bold text-[#7C5CFF]">{evento.vagasEncontreiro}</h1>
            <p className="text-[#7C8AA5] text-sm">disponíveis</p>
            <div className="mt-4">
              <Link href={evento.vagasEncontreiro > 0 ? `/form-encounter/${idEvento}` : "#"} passHref target="_blank">
                <Button disabled={evento.vagasEncontreiro === 0} className="mt-2 w-full sm:w-auto border border-[#7C5CFF]/50 bg-transparent text-[#CBD5E1] hover:bg-[#7C5CFF]/10 hover:border-[#7C5CFF]/70 rounded-xl transition-colors">
                  Cadastrar encontreiros
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 flex flex-col md:flex-row gap-4">
        <EncountersList
          title="Gerencie os encontristas confirmados"
          description="Lista de encontristas confirmados neste evento"
          link={`/meet/${idEvento}`}
          emptyMessage="Visualize todos os encontristas cadastrados até o momento e gerencie-os facilmente."
        />
        <EncounterList
          title="Gerencie os encontreiros confirmados"
          description="Lista de encontreiros confirmados neste evento"
          link={`/encounters/${idEvento}`}
          emptyMessage="Visualize todos os encontreiros cadastrados até o momento e gerencie-os facilmente."
        />
      </section>
    </main>
  );
}