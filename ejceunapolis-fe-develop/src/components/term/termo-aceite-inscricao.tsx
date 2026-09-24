"use client";

import { useState } from "react";
import { CheckCircle2, FileText, LockKeyhole } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const TERMO_INSCRICAO_VERSAO = "EJC-2026-v1";

const secoes = [
  {
    titulo: "1. Da inscrição",
    itens: [
      "A inscrição será realizada exclusivamente pelos meios disponibilizados pela organização.",
      "O preenchimento do formulário manifesta interesse em participar. A inscrição somente será efetivada após a confirmação do pagamento integral do valor apresentado no momento da inscrição.",
      "O pagamento deverá seguir as orientações da organização.",
      "O participante declara que as informações fornecidas são verdadeiras, completas e atualizadas e se responsabiliza por sua correção.",
      "A inscrição é individual e pessoal, vinculada aos dados do participante.",
    ],
  },
  {
    titulo: "2. Da taxa de inscrição e da desistência",
    itens: [
      "O valor da inscrição é aquele apresentado no momento da inscrição.",
      "Após a confirmação do pagamento, o valor não será devolvido em caso de desistência por iniciativa do participante, ressalvadas as hipóteses previstas na legislação aplicável.",
      "A organização poderá avaliar situações excepcionais, sem que isso represente obrigação de restituição quando não houver previsão legal.",
    ],
  },
  {
    titulo: "3. Da transferência da inscrição",
    itens: [
      "Em caso de desistência, o participante poderá transferir sua inscrição para outra pessoa, observadas estas regras.",
      "A negociação financeira ocorrerá exclusivamente entre as partes, sem responsabilidade do EDG por valores negociados.",
      "A transferência somente será válida após comunicação ao EDG e fornecimento dos dados do novo participante dentro do prazo definido.",
      "A transferência corresponde à vaga e não garante ao novo participante a mesma equipe do participante original.",
      "A nova equipe será definida pelo EDG conforme os critérios de organização do EJC.",
    ],
  },
  {
    titulo: "4. Da divisão das equipes",
    itens: [
      "A divisão dos participantes em equipes será realizada pelo EDG — Equipe de Direção Geral.",
      "A composição seguirá critérios internos para o bom funcionamento do programa.",
      "Não será possível exigir determinada equipe, líder, grupo de amigos, acompanhante ou composição específica, salvo exceção definida pela organização.",
      "O EDG poderá alterar a composição das equipes quando necessário.",
    ],
  },
  {
    titulo: "5. Das regras de participação",
    itens: [
      "O participante compromete-se a respeitar orientações, horários, atividades, normas de convivência e determinações da organização.",
      "Todos os participantes, líderes, voluntários e organizadores deverão ser tratados com respeito.",
      "Não serão admitidos violência, ameaças, discriminação, assédio, desrespeito, danos ao patrimônio, perturbação intencional ou conduta incompatível com os princípios cristãos e as normas do EJC.",
      "O descumprimento poderá resultar em advertência, afastamento de atividade ou desligamento do evento, conforme a gravidade.",
    ],
  },
  {
    titulo: "6. Da responsabilidade sobre objetos pessoais",
    itens: [
      "O participante é responsável por documentos, aparelhos eletrônicos, dinheiro, acessórios e demais pertences.",
      "A organização não se responsabiliza por perda, extravio, dano ou desaparecimento, salvo quando houver responsabilidade legal.",
    ],
  },
  {
    titulo: "7. Dos documentos e informações",
    itens: [
      "Os documentos e dados fornecidos devem ser verdadeiros e pertencer ao participante ou ter sido fornecidos de forma legítima.",
      "A organização poderá solicitar correção ou confirmação de informações incorretas, incompletas ou incompatíveis.",
      "Quando necessário, o participante deverá apresentar documentos e informações dentro dos prazos definidos.",
    ],
  },
  {
    titulo: "8. Da proteção e do tratamento de dados pessoais",
    itens: [
      "Os dados pessoais fornecidos serão usados para inscrição, identificação, organização, comunicação, segurança, controle de participantes, formação de equipes, pagamentos e execução das atividades do EJC.",
      "O tratamento observará a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).",
      "Dados poderão ser compartilhados internamente apenas com pessoas diretamente envolvidas na organização e quando necessário.",
      "Os dados serão mantidos pelo período necessário às finalidades informadas e ao cumprimento de obrigações legais.",
      "A organização adotará medidas razoáveis de segurança contra acesso não autorizado, perda, alteração, divulgação ou uso indevido.",
    ],
  },
  {
    titulo: "9. Do uso de imagem",
    itens: [
      "Poderão ser realizadas fotografias e gravações durante o EJC.",
      "A autorização para utilização de imagem será apresentada separadamente, quando aplicável, permitindo manifestação específica do participante.",
      "O aceite deste termo não substitui a autorização de uso de imagem.",
    ],
  },
  {
    titulo: "10. Da programação do evento",
    itens: [
      "Programação, horários, locais, atividades, equipes e líderes poderão ser alterados quando necessário.",
      "Alterações serão comunicadas pelos canais oficiais da organização.",
      "O participante deve acompanhar as comunicações e manter seus contatos atualizados.",
    ],
  },
  {
    titulo: "11. Da conduta e dos princípios do EJC",
    itens: [
      "O EJC é realizado no contexto da Igreja Adventista do Sétimo Dia e possui caráter cristão, espiritual, educativo e comunitário.",
      "O participante compromete-se a respeitar seus princípios, valores, orientações e normas de convivência.",
      "A participação pressupõe respeito à liberdade, dignidade, integridade e individualidade de todos.",
    ],
  },
  {
    titulo: "12. Da responsabilidade do participante",
    itens: [
      "O participante fornecerá informações verdadeiras e comunicará circunstâncias relevantes para sua participação segura.",
      "O participante deverá cumprir as orientações da organização e colaborar com o andamento das atividades.",
      "Para menores de idade, a participação estará condicionada às autorizações e aos documentos exigidos dos responsáveis legais.",
    ],
  },
  {
    titulo: "13. Do aceite",
    itens: [
      "Ao finalizar a inscrição, o participante declara que leu e compreendeu integralmente este termo e concorda com as condições de inscrição e participação.",
      "Declara ciência de que a inscrição só será efetivada após a confirmação do pagamento do valor apresentado no momento da inscrição.",
      "Declara ciência das regras de desistência, transferência e formação das equipes.",
      "Confirma que os dados fornecidos são verdadeiros e está ciente de seu tratamento para as finalidades relacionadas ao EJC.",
      "Compromete-se a respeitar as regras, orientações e princípios do evento.",
    ],
  },
  {
    titulo: "14. Disposições finais",
    itens: [
      "Este termo é apresentado antes da conclusão da inscrição para permitir sua leitura e concordância.",
      "A marcação da opção de aceite representa declaração eletrônica de ciência e concordância, sem prejuízo dos direitos assegurados pela legislação.",
      "Casos não previstos serão analisados pelo EDG, observando a legislação, a boa-fé, o respeito, a segurança e a organização do evento.",
    ],
  },
];

interface TermoAceiteInscricaoProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export default function TermoAceiteInscricao({
  accepted,
  onAcceptedChange,
}: TermoAceiteInscricaoProps) {
  const [leituraConcluida, setLeituraConcluida] = useState(accepted);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const chegouAoFim =
      element.scrollHeight - element.scrollTop - element.clientHeight <= 24;

    if (chegouAoFim) {
      setLeituraConcluida(true);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-violet-400/30 bg-violet-500/[0.06] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-violet-500/15 p-2 text-violet-300">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">
              Termo de inscrição e participação
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Leia o conteúdo abaixo e role até o final para liberar o aceite.
            </p>
          </div>
        </div>
      </div>

      <div
        onScroll={handleScroll}
        tabIndex={0}
        aria-label="Conteúdo completo do termo de inscrição"
        className="h-[55vh] min-h-[340px] max-h-[620px] space-y-5 overflow-y-auto rounded-xl border border-white/15 bg-[#0B1020] p-4 pr-3 text-sm leading-relaxed text-slate-300 shadow-inner sm:h-[50vh] sm:p-6"
      >
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-slate-50">
            TERMO DE ACEITE, INSCRIÇÃO E CONDIÇÕES DE PARTICIPAÇÃO
          </h3>
          <p className="font-semibold text-violet-300">
            EJC — Encontro de Jovens com Cristo de Eunápolis/BA
          </p>
          <p><strong>Organização:</strong> EDG — Equipe de Direção Geral</p>
          <p><strong>Instituição:</strong> Igreja Adventista do Sétimo Dia</p>
          <p><strong>Local:</strong> Eunápolis — Bahia</p>
        </div>

        <p>
          Ao realizar sua inscrição, o participante declara que leu atentamente este termo,
          compreendeu seu conteúdo e concorda com as regras, condições e orientações da
          organização. Este termo integra as condições de inscrição e participação no EJC.
        </p>

        {secoes.map((secao) => (
          <section key={secao.titulo} className="space-y-2">
            <h3 className="font-semibold text-slate-100">{secao.titulo}</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              {secao.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <div className="rounded-lg border border-violet-400/25 bg-violet-500/[0.07] p-4">
          <h3 className="font-semibold text-slate-100">Declaração de aceite</h3>
          <p className="mt-2">
            Declaro que li, compreendi e concordo integralmente com este Termo de Aceite,
            Inscrição e Condições de Participação do EJC.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="font-medium">Você chegou ao final do termo.</span>
        </div>
      </div>

      {!leituraConcluida && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          Role o termo até o final para habilitar a confirmação.
        </div>
      )}

      <label
        htmlFor="termo-inscricao"
        className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
          leituraConcluida
            ? "cursor-pointer border-violet-400/40 bg-violet-500/[0.08]"
            : "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60"
        }`}
      >
        <Checkbox
          id="termo-inscricao"
          checked={accepted}
          disabled={!leituraConcluida}
          onCheckedChange={(checked) => onAcceptedChange(checked === true)}
          className="mt-0.5 border-slate-500 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-600"
        />
        <span className="text-sm font-medium leading-relaxed text-slate-100">
          Li e concordo com o termo de inscrição e participação
          <span className="text-rose-500"> *</span>
        </span>
      </label>
    </section>
  );
}
