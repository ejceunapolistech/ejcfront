"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import backgroundImage from "@/app/assets/img/background-bandinha.jpg";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";

interface EventData {
  idEvento: string;
  nomeEvento: string;
  vagasEncontreiro: number;
  vagasEncontristas: number;
  valorEncontreiro: number;
  valorEncontrista: number;
}

export default function Event() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nomeEvento, setNomeEvento] = useState("");
  const [vagasEncontristas, setVagasEncontristas] = useState(0);
  const [vagasEncontreiro, setVagasEncontreiro] = useState(0);
  const [valorEncontreiro, setValorEncontreiro] = useState(0);
  const [valorEncontrista, setValorEncontrista] = useState(0);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("idEvento");
    router.push("/");
  };

  const handleCreateEvent = async () => {
    const idUsuario = localStorage.getItem("idUsuario");
    const token = localStorage.getItem("token");
    if (!idUsuario || !token) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/evento`,
        { nomeEvento, vagasEncontristas, vagasEncontreiro, idUsuario, valorEncontreiro, valorEncontrista },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      setOpen(false);
      setEvents((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setProgress(30);
      const idUsuario = localStorage.getItem("idUsuario");
      const token = localStorage.getItem("token");
      if (!idUsuario || !token) { setLoading(false); return; }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ejceunapolis/api/evento/buscar-por-usuario/${idUsuario}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-[#080B12]">
      {/* Left — image */}
      <div className="hidden md:flex items-center justify-center relative overflow-hidden">
        <Image src={backgroundImage} alt="EJC" className="w-full h-full object-cover"
          style={{ filter: "grayscale(70%) contrast(1.05) brightness(0.65)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,11,18,0.15), rgba(8,11,18,0.80))" }} />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#7C5CFF]/40 to-transparent" />
      </div>

      {/* Right — content */}
      <div className="p-6 w-full bg-[#080B12] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl text-[#F8FAFC] tracking-tight">Meus eventos</h1>
            <p className="text-[#7C8AA5] text-sm mt-1">
              Gerencie o seu evento do início ao fim!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#101624] border border-[#20293A] text-[#94A3B8] transition-colors hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </button>
        </div>

        {loading ? (
          <Progress value={progress} className="w-[60%] h-1 bg-[#20293A] [&>div]:bg-[#7C5CFF]" />
        ) : events.length === 0 ? (
          <div className="flex justify-center items-center h-36 rounded-2xl border border-dashed border-[#20293A] text-[#526079]">
            Nenhum evento cadastrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {events.map((event) => (
              <Card
                key={event.idEvento}
                className="rounded-2xl border border-[#20293A] bg-[#101624] shadow-lg shadow-black/20 hover:border-[#7C5CFF]/35 hover:bg-[#121A2A] transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-[#F8FAFC] font-semibold">{event.nomeEvento}</CardTitle>
                    <Link
                      href={`/dashboard/${event.idEvento}`}
                      className="text-sm font-semibold text-[#7C5CFF] hover:text-[#8B6DFF] transition-colors"
                    >
                      Acessar
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#7C8AA5]">
                    Vagas para encontristas{" "}
                    <span className="text-[#F6C453] font-semibold">({event.vagasEncontristas})</span>
                  </p>
                  <p className="text-sm text-[#7C8AA5] mt-1">
                    Vagas para encontreiros{" "}
                    <span className="text-[#F6C453] font-semibold">({event.vagasEncontreiro})</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 bg-transparent border border-[#20293A] text-[#CBD5E1] hover:bg-[#101624] hover:border-[#7C5CFF]/30 rounded-xl gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Criar novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#101624] border-[#20293A] text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-[#F8FAFC]">Criar evento</DialogTitle>
              <DialogDescription className="text-[#7C8AA5]">
                Preencha os detalhes para criar um novo evento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { id: "nomeEvento", label: "Nome do evento", type: "text", value: nomeEvento, onChange: setNomeEvento },
                { id: "vagasEncontristas", label: "Quantidade de encontristas", type: "number", value: vagasEncontristas, onChange: (v: string) => setVagasEncontristas(Number(v)) },
                { id: "vagasEncontreiro", label: "Quantidade de encontreiros", type: "number", value: vagasEncontreiro, onChange: (v: string) => setVagasEncontreiro(Number(v)) },
                { id: "valorEncontreiro", label: "Valor da inscrição para encontreiros", type: "text", value: valorEncontreiro, onChange: (v: string) => setValorEncontreiro(Number(v)) },
                { id: "valorEncontrista", label: "Valor da inscrição para encontristas", type: "text", value: valorEncontrista, onChange: (v: string) => setValorEncontrista(Number(v)) },
              ].map(({ id, label, type, value, onChange }) => (
                <div key={id} className="grid gap-2">
                  <Label htmlFor={id} className="text-[#CBD5E1] text-sm">{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-[#0B0F19] border-[#20293A] text-[#F8FAFC] placeholder:text-[#526079] focus-visible:ring-[#7C5CFF] rounded-xl"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateEvent}
                className="bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white rounded-xl transition-colors"
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
