import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Link from "next/link";

interface Encounters {
  idEncontrista: string;
  nomeCompleto: string;
  icon: string;
  nomePadrinho: string;
  dataCriacao: string;
  statusPagamento: string;
}

interface EncountersListProps {
  title: string;
  description: string;
  link: string;
  encounters?: Encounters[];
  emptyMessage?: string;
}

export default function EncountersList({
  title,
  description,
  link,
  emptyMessage,
}: EncountersListProps) {

  const statusPagamentoTraduzido: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
  };

  // return (
  //   <Card className="flex-1">
  //     <CardHeader>
  //       <div className="flex items-center justify-between">
  //         <CardTitle className="text-lg sm:text-xl text-gray-800">{title}</CardTitle>
  //         <Link
  //           href={link}
  //           className="flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
  //         >
  //           <span className="font-bold">Acessar</span>
  //         </Link>
  //       </div>
  //       <CardDescription>{description}</CardDescription>
  //     </CardHeader>
  //     <CardContent>
  //       {encounters.length > 0 ? (
  //         encounters.map((encounter, index) => (
  //           <article key={encounter.idEncontrista || index} className="flex items-center gap-2 border-b py-2">
  //             <Avatar className="w-8 h-8">
  //               <AvatarFallback>{encounter.icon}</AvatarFallback>
  //             </Avatar>
  //             <div>
  //               <p className="text-base sm:text-base font-semibold">
  //                 {encounter.nomeCompleto} 
  //                 <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
  //                   encounter.statusPagamento === "approved"
  //                     ? "bg-green-200 text-green-800"
  //                     : "bg-yellow-200 text-yellow-800"
  //                 }`}>
  //                   {statusPagamentoTraduzido[encounter.statusPagamento as keyof typeof statusPagamentoTraduzido] || "Não pago"}
  //                 </span>
  //               </p>
  //               <p className="text-base sm:text-base font-normal">Padrinho: <span className="text-cyan-700 font-semibold">{encounter.nomePadrinho}</span></p>
  //               <p className="text-xs">
  //                 Confirmou a inscrição em{" "}
  //                 <span className="font-semibold text-xs">
  //                   {encounter.dataCriacao
  //                     ? new Intl.DateTimeFormat("pt-BR", {
  //                         day: "2-digit",
  //                         month: "2-digit",
  //                         year: "numeric",
  //                       }).format(new Date(encounter.dataCriacao))
  //                     : "Data inválida"}
  //                 </span>{" "}
  //                 às{" "}
  //                 <span className="font-semibold">
  //                   {encounter.dataCriacao
  //                     ? new Intl.DateTimeFormat("pt-BR", {
  //                         hour: "2-digit",
  //                         minute: "2-digit",
  //                         second: "2-digit",
  //                         hour12: false,
  //                       }).format(new Date(encounter.dataCriacao))
  //                     : "--:--:--"}
  //                 </span>
  //               </p>
  //             </div>
  //           </article>
  //         ))
  //       ) : (
  //         <div className="flex items-center justify-center h-36">
  //           <p className="text-gray-500">{emptyMessage}</p>
  //         </div>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

  return (
  <Card className="flex-1">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg sm:text-xl text-slate-100">{title}</CardTitle>
        <Link
          href={link}
          className="flex items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-[#7C5CFF]"
        >
          <span className="font-bold">Acessar</span>
        </Link>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>

    {/* Se quiser manter algum conteúdo visual, pode deixar esse espaço opcional */}
    <CardContent>
      <div className="flex h-36">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    </CardContent>
  </Card>
);
}
