"use client";

import logo from "@/app/assets/img/logo-2025.png";
import Image from "next/image";

export default function PagamentoSucesso() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-[#080B12] px-4">
      <div className="rounded-2xl border border-[#20293A] bg-[#101624] shadow-lg shadow-black/20 p-10 text-center max-w-md w-full">
        <Image src={logo} alt="EJC Eunápolis" className="w-[110px] h-auto rounded-2xl mx-auto mb-6 shadow-lg" />
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#F6C453]/15 border border-[#F6C453]/30 flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#F6C453] mb-3">Inscrição realizada com sucesso!</h2>
        <p className="text-[#7C8AA5] mb-2">
          Caso ocorra algum problema com o pagamento entraremos em contato.
        </p>
        <p className="text-[#7C8AA5] mb-4">
          Em caso de agendamento por pix, a sua inscrição será cancelada automaticamente.
        </p>
        <p className="text-[#F6C453] font-semibold">Deus te abençoe.</p>
      </div>
    </section>
  );
}