"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import backgroundImage from "@/app/assets/img/background-inicial.jpeg";
import logo from "@/app/assets/img/logo-2025.png";
import { Progress } from "@/components/ui/progress";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setProgress(30);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/public/autenticacao`,
        { usuario: email, senha },
        { headers: { "Content-Type": "application/json" } }
      );
      setProgress(70);
      const data = response.data;
      if (!data.token || !data.idUsuario) throw new Error("Token não recebido.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("idUsuario", data.idUsuario);
      setProgress(100);
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError("Usuário ou senha inválidos, verifique e tente novamente.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-[#080B12]">
      {/* Left — image */}
      <div className="hidden md:flex items-center justify-center relative overflow-hidden">
        <Image
          src={backgroundImage}
          alt="EJC"
          className="w-full h-full object-cover"
          style={{ filter: "grayscale(70%) contrast(1.05) brightness(0.7)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,11,18,0.30), rgba(8,11,18,0.88))" }} />
        <div className="absolute flex flex-col gap-4 mx-8 bottom-12">
          <Image src={logo} alt="EJC Eunápolis" className="w-[130px] h-auto rounded-2xl shadow-xl" />
          <h1 className="text-white text-lg font-bold">
            <span className="text-xl text-[#F6C453]">Facilite a organização do seu EJC!</span>
            <br />
            <span className="text-[#CBD5E1] text-sm font-normal">
              Gerencie o evento, participantes e toda a estrutura do encontro de forma simples e eficiente.
            </span>
          </h1>
        </div>
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#7C5CFF]/40 to-transparent" />
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center p-8 bg-[#080B12]">
        <div className="w-full max-w-sm">
          <h2 className="font-bold text-3xl mb-1 text-[#F8FAFC] tracking-tight">Acessar evento EJC</h2>
          <p className="text-[#7C8AA5] text-sm mb-8">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[#CBD5E1] text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-[#0B0F19] border-[#20293A] text-[#F8FAFC] placeholder:text-[#526079] focus-visible:ring-[#7C5CFF] focus-visible:border-[#7C5CFF] h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#CBD5E1] text-sm">Senha</Label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-[#0B0F19] border-[#20293A] text-[#F8FAFC] placeholder:text-[#526079] focus-visible:ring-[#7C5CFF] focus-visible:border-[#7C5CFF] h-11 rounded-xl"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {loading && <Progress value={progress} className="w-full h-1 bg-[#20293A] [&>div]:bg-[#7C5CFF]" />}

            <Button
              className="w-full h-11 bg-[#7C5CFF] hover:bg-[#8B6DFF] text-white font-semibold rounded-xl shadow-md transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
