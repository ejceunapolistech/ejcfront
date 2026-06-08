"use client";

import logo from "@/app/assets/img/logo-2025.png";
import Image from "next/image";

export default function PagamentoFalha() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-[#080B12] px-4">
      <div className="rounded-2xl border border-[#20293A] bg-[#101624] shadow-lg shadow-black/20 p-10 text-center max-w-md w-full">
        <Image src={logo} alt="EJC Eunápolis" className="w-[110px] h-auto rounded-2xl mx-auto mb-6 shadow-lg" />
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <span className="text-3xl text-red-400">✕</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-3">Pagamento Falhou!</h2>
        <p className="text-[#7C8AA5] mb-2">Ocorreu um erro ao processar seu pagamento.</p>
        <p className="text-[#7C8AA5] mb-2">Por favor, tente novamente.</p>
      </div>
    </section>
  );
}