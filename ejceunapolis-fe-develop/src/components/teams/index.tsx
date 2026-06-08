import { Cookie, Guitar, Handshake, UserRoundCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Teams() {
    const teams = [
        { name: "Boa Vontade", total: "25/30 colaboradores", icon: <Handshake /> },
        { name: "Bandinha", total: "49/50 colaboradores", icon: <Guitar /> },
        { name: "Biscoitinho", total: "19/20 colaboradores", icon: <Cookie /> },
    ];
 return (
    <Card className="flex-1 bg-[#101624] border-[#20293A]">
    <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl text-[#F8FAFC]">
                Total de colaboradores por equipe
            </CardTitle>
            <Link
                href="#"
                className="flex items-center justify-center rounded-lg text-[#7C8AA5] transition-colors hover:text-[#7C5CFF]"
            >
                <span className="font-bold">Acessar</span>
            </Link>
        </div>
        <CardDescription className="text-[#7C8AA5]">
            Equipes próximas do limite esperado
        </CardDescription>
    </CardHeader>
    <CardContent>
        {teams.map((team, index) => (
            <article key={index} className="flex items-center gap-2 border-b border-[#20293A] py-2">
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#7C5CFF]/15 text-[#C4B5FD] border border-[#7C5CFF]/25">{team.icon}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <p className="text-sm sm:text-base font-semibold text-[#CBD5E1]">{team.name}</p>
                    </div>
                    <span className="text-[12px] sm:text-sm text-[#7C8AA5]">{team.total}</span>
                </div>
            </article>
        ))}
    </CardContent>
</Card>
  );
}