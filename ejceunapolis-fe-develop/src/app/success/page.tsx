"use client";
import logo from "@/app/assets/img/logo-2025.png";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function PagamentoSucesso() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-[#070A13]">
      <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-10 text-center max-w-md mx-4">
        <Image src={logo} alt="EJC Eunápolis" className="w-[120px] h-auto rounded-2xl mx-auto mb-6 shadow-lg" />
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-400 mb-3">Pagamento Aprovado!</h2>
        <p className="text-slate-400 mb-1">Seu pagamento foi realizado com sucesso.</p>
        <p className="text-slate-400">Agradecemos por sua inscrição.</p>
        <p className="text-amber-400 font-semibold mt-4">Deus te abençoe!</p>
      </div>
    </section>
  );
}
