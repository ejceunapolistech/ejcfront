"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import logo from "@/app/assets/img/logo-2025.png";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  HeartPulse,
  HeartHandshake,
  Users,
  ScrollText,
  CreditCard,
  Loader2,
  Camera,
  Upload,
  X,
} from "lucide-react";
import TermoAceiteInscricao from "@/components/term/termo-aceite-inscricao";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  nomeCompleto: string;
  emailEncontrista: string;
  nomePreferido: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  religiao: string;
  whatsapp: string;
  instagram: string;
  alergicoMedicamentos: boolean | null;
  medicamentosAlergia: string;
  medicamentosEspecificos: string;
  possuiDietaEspecial: boolean | null;
  dietaEspecial: string;
  possuiNecessidadeEspecifica: boolean | null;
  necessidadeEspecifica: string;
  nomePadrinho: string;
  whatsappPadrinho: string;
  circulo: string;
  termoAceito: boolean;
}

const STEPS = [
  { id: 1, label: "Dados Pessoais", icon: User },
  { id: 2, label: "Endereço", icon: MapPin },
  { id: 3, label: "Saúde", icon: HeartPulse },
  { id: 4, label: "Padrinho", icon: Users },
  { id: 5, label: "Foto", icon: Camera },
  { id: 6, label: "Termo", icon: ScrollText },
  { id: 7, label: "Pagamento", icon: CreditCard },
];

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function RequiredBooleanChoice({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-100">
        {label}
        <span className="text-rose-500 ml-1">*</span>
      </Label>
      {description && <p className="text-xs leading-relaxed text-slate-400">{description}</p>}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: true, label: "Sim" },
          { value: false, label: "Não" },
        ].map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                selected
                  ? "border-[#8B5CF6] bg-violet-500/15 text-violet-200 shadow-sm shadow-violet-950/40"
                  : "border-white/15 bg-[#0B101D] text-slate-300 hover:border-violet-400/50 hover:text-slate-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EncountersForm() {
  const params = useParams();
  const idEvento = params?.idEvento as string;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    emailEncontrista: "",
    nomePreferido: "",
    dataNascimento: "",
    nomePai: "",
    nomeMae: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    religiao: "",
    whatsapp: "",
    instagram: "",
    alergicoMedicamentos: null,
    medicamentosAlergia: "",
    medicamentosEspecificos: "",
    possuiDietaEspecial: null,
    dietaEspecial: "",
    possuiNecessidadeEspecifica: null,
    necessidadeEspecifica: "",
    nomePadrinho: "",
    whatsappPadrinho: "",
    circulo: "AZUL",
    termoAceito: false,
  });

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const formatDate = (e: React.FormEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length >= 5)
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    else if (value.length >= 3)
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    e.currentTarget.value = value;
    set("dataNascimento", value);
  };

  const formatPhone = (field: "whatsapp" | "whatsappPadrinho") =>
    (e: React.FormEvent<HTMLInputElement>) => {
      const target = e.currentTarget;
      let value = target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length >= 7)
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      else if (value.length >= 3)
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      target.value = value;
      set(field, value);
    };

  // Validação por step
  const isStep1Valid =
    formData.nomeCompleto.trim() !== "" &&
    formData.emailEncontrista.trim() !== "" &&
    formData.nomePreferido.trim() !== "" &&
    formData.dataNascimento.trim() !== "" &&
    formData.nomePai.trim() !== "" &&
    formData.nomeMae.trim() !== "" &&
    formData.religiao.trim() !== "" &&
    formData.whatsapp.trim() !== "";

  const isStep2Valid =
    formData.logradouro.trim() !== "" &&
    formData.numero.trim() !== "" &&
    formData.bairro.trim() !== "" &&
    formData.cidade.trim() !== "" &&
    formData.estado.trim() !== "";

  const isStep3Valid =
    formData.alergicoMedicamentos !== null &&
    (!formData.alergicoMedicamentos ||
      formData.medicamentosAlergia.trim() !== "") &&
    formData.possuiDietaEspecial !== null &&
    (!formData.possuiDietaEspecial ||
      formData.dietaEspecial.trim() !== "") &&
    formData.possuiNecessidadeEspecifica !== null &&
    (!formData.possuiNecessidadeEspecifica ||
      formData.necessidadeEspecifica.trim() !== "");

  const isStep4Valid =
    formData.nomePadrinho.trim() !== "" &&
    formData.whatsappPadrinho.trim() !== "";

  const isStep5Valid = fotoFile !== null;

  const canAdvance =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid) ||
    (step === 4 && isStep4Valid) ||
    (step === 5 && isStep5Valid) ||
    (step === 6 && formData.termoAceito);

  // Seleciona foto e gera preview
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.termoAceito) {
      setError("Leia e aceite o termo de inscrição antes de continuar.");
      return;
    }
    if (!fotoFile) {
      setError("Selecione uma foto antes de continuar.");
      setStep(5);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/encontrista/${idEvento}`,
        formData,
        { headers: { "Content-Type": "application/json", Accept: "*/*" } }
      );
      const idEncontrista = response.data.idEncontrista;
      // Upload da foto
      const formDataFoto = new FormData();
      formDataFoto.append("foto", fotoFile!);
      await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/encontrista/${idEncontrista}/foto`,
        formDataFoto,
        { headers: { "Content-Type": "multipart/form-data", Accept: "*/*" } }
      );

      // Pagamento
      const pagamentoResponse = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/pagamentos/cartao`,
        { idEvento, idEncontrista },
        { headers: { "Content-Type": "application/json", Accept: "*/*" } }
      );
      window.location.href = pagamentoResponse.data.linkPagamento;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Erro ao enviar os dados. Tente novamente.");
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A13] via-[#0A0D18] to-[#120A1F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src={logo}
            alt="EJC Eunápolis"
            className="w-20 h-auto rounded-xl shadow-sm mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-50">
            Inscrição de Encontrista
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Preencha os dados para confirmar sua participação
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? "bg-violet-600 text-white" : ""}
                      ${isCurrent ? "bg-[#6D3DF2] text-white ring-4 ring-purple-950/40" : ""}
                      ${!isCompleted && !isCurrent ? "bg-transparent border-2 border-white/15 text-slate-400" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${isCurrent || isCompleted ? "text-[#A78BFA]" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${step > s.id ? "bg-violet-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card do formulário */}
        <div className="rounded-2xl border border-white/10 bg-[#101522]/80 shadow-xl shadow-black/30 p-6 sm:p-8">
          {/* Step 1 — Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Nome completo" required>
                    <Input
                      value={formData.nomeCompleto}
                      onChange={(e) => set("nomeCompleto", e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </FormField>
                </div>
                <FormField label="Como prefere ser chamado(a)" required>
                  <Input
                    value={formData.nomePreferido}
                    onChange={(e) => set("nomePreferido", e.target.value)}
                    placeholder="Apelido ou nome preferido"
                  />
                </FormField>
                <FormField label="Data de nascimento" required>
                  <Input
                    type="text"
                    value={formData.dataNascimento}
                    onInput={formatDate}
                    onChange={(e) => set("dataNascimento", e.target.value)}
                    placeholder="DD/MM/AAAA"
                  />
                </FormField>
                <FormField label="E-mail" required>
                  <Input
                    type="email"
                    value={formData.emailEncontrista}
                    onChange={(e) => set("emailEncontrista", e.target.value)}
                    placeholder="seu@email.com"
                  />
                </FormField>
                <FormField label="WhatsApp" required>
                  <Input
                    type="text"
                    value={formData.whatsapp}
                    onInput={formatPhone("whatsapp")}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </FormField>
                <FormField label="Instagram">
                  <Input
                    value={formData.instagram}
                    onChange={(e) => set("instagram", e.target.value)}
                    placeholder="@seuperfil"
                  />
                </FormField>
                <FormField label="Nome do pai" required>
                  <Input
                    value={formData.nomePai}
                    onChange={(e) => set("nomePai", e.target.value)}
                    placeholder="Nome do seu pai"
                  />
                </FormField>
                <FormField label="Nome da mãe" required>
                  <Input
                    value={formData.nomeMae}
                    onChange={(e) => set("nomeMae", e.target.value)}
                    placeholder="Nome da sua mãe"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Religião" required>
                    <Input
                      value={formData.religiao}
                      onChange={(e) => set("religiao", e.target.value)}
                      placeholder="Ex: Católico"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Endereço */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Endereço
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Logradouro" required>
                  <Input
                    value={formData.logradouro}
                    onChange={(e) => set("logradouro", e.target.value)}
                    placeholder="Rua, Av..."
                  />
                </FormField>
                <FormField label="Número" required>
                  <Input
                    value={formData.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="123"
                  />
                </FormField>
                <FormField label="Bairro" required>
                  <Input
                    value={formData.bairro}
                    onChange={(e) => set("bairro", e.target.value)}
                    placeholder="Seu bairro"
                  />
                </FormField>
                <FormField label="Cidade" required>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => set("cidade", e.target.value)}
                    placeholder="Sua cidade"
                  />
                </FormField>
                <FormField label="Estado" required>
                  <Input
                    value={formData.estado}
                    onChange={(e) =>
                      set("estado", e.target.value.toUpperCase())
                    }
                    placeholder="BA"
                    maxLength={2}
                    className="uppercase"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Step 3 — Saúde */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  Informações de Saúde
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Essas informações são importantes para garantir seu bem-estar
                  durante o evento.
                </p>
              </div>

              <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">
                      Alergias e alimentação
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Selecione Sim ou Não em cada pergunta.
                    </p>
                  </div>
                </div>

                <RequiredBooleanChoice
                  value={formData.alergicoMedicamentos}
                  onChange={(value) => {
                    set("alergicoMedicamentos", value);
                    if (!value) {
                      set("medicamentosAlergia", "");
                      set("medicamentosEspecificos", "");
                    }
                  }}
                  label="Possui alergia a medicamentos?"
                  description="Informe se você possui alguma alergia conhecida."
                />

                {formData.alergicoMedicamentos === true && (
                  <div className="space-y-4 border-l-2 border-rose-400/50 pl-4">
                    <FormField label="Quais medicamentos causam alergia?" required>
                      <Input
                        value={formData.medicamentosAlergia}
                        onChange={(e) =>
                          set("medicamentosAlergia", e.target.value)
                        }
                        placeholder="Ex: Dipirona, Penicilina..."
                      />
                    </FormField>
                    <FormField label="Medicamentos específicos que usa">
                      <Input
                        value={formData.medicamentosEspecificos}
                        onChange={(e) =>
                          set("medicamentosEspecificos", e.target.value)
                        }
                        placeholder="Medicamentos de uso contínuo"
                      />
                    </FormField>
                  </div>
                )}

                <div className="border-t border-white/10 pt-5">
                  <RequiredBooleanChoice
                    value={formData.possuiDietaEspecial}
                    onChange={(value) => {
                      set("possuiDietaEspecial", value);
                      if (!value) set("dietaEspecial", "");
                    }}
                    label="Possui dieta especial ou alguma restrição alimentar?"
                    description="Por exemplo: alimentação vegetariana, intolerância à lactose, glúten ou outra restrição."
                  />
                </div>

                {formData.possuiDietaEspecial === true && (
                  <div className="border-l-2 border-amber-400/50 pl-4">
                    <FormField label="Descreva sua dieta ou restrição alimentar" required>
                      <Input
                        value={formData.dietaEspecial}
                        onChange={(e) => set("dietaEspecial", e.target.value)}
                        placeholder="Ex: Vegetariano, sem glúten..."
                      />
                    </FormField>
                  </div>
                )}
              </section>

              <section className="space-y-5 rounded-2xl border border-violet-400/30 bg-violet-500/[0.06] p-4 sm:p-5">
                <div className="flex items-start gap-3 border-b border-violet-400/20 pb-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-50">
                      Acessibilidade e necessidades de apoio
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      Conte somente o que a equipe precisa saber para acolher você
                      com segurança e conforto.
                    </p>
                  </div>
                </div>

                <RequiredBooleanChoice
                  value={formData.possuiNecessidadeEspecifica}
                  onChange={(value) => {
                    set("possuiNecessidadeEspecifica", value);
                    if (!value) set("necessidadeEspecifica", "");
                  }}
                  label="Durante o evento, você precisará de algum recurso de acessibilidade, adaptação ou apoio específico?"
                  description="Pode envolver mobilidade, comunicação, sensibilidade sensorial, situações de ansiedade ou outro apoio importante. Não é necessário informar diagnóstico."
                />

                {formData.possuiNecessidadeEspecifica === true && (
                  <div className="border-l-2 border-violet-400/60 pl-4">
                    <FormField label="Conte como podemos tornar sua participação mais segura e confortável" required>
                      <Textarea
                        value={formData.necessidadeEspecifica}
                        onChange={(e) =>
                          set("necessidadeEspecifica", e.target.value)
                        }
                        placeholder="Descreva apenas os recursos, adaptações ou apoios que a equipe precisa providenciar."
                        rows={4}
                      />
                    </FormField>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Step 4 — Padrinho */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Dados do Padrinho / Madrinha
              </h2>
              <FormField label="Nome do padrinho / madrinha" required>
                <Input
                  value={formData.nomePadrinho}
                  onChange={(e) => set("nomePadrinho", e.target.value)}
                  placeholder="Nome completo"
                />
              </FormField>
              <FormField label="WhatsApp do padrinho / madrinha" required>
                <Input
                  type="text"
                  value={formData.whatsappPadrinho}
                  onInput={formatPhone("whatsappPadrinho")}
                  onChange={(e) => set("whatsappPadrinho", e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </FormField>
            </div>
          )}

          {/* Step 5 — Foto */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-1">
                Foto do Encontrista
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Envie uma foto recente do encontrista. Ela será salva junto ao cadastro.
              </p>

              {!fotoPreview ? (
                <label
                  htmlFor="foto-upload"
                  className="flex flex-col items-center justify-center w-full h-52 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:border-[#6D3DF2]/50 hover:bg-[#6D3DF2]/5 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#6D3DF2]/15 border border-[#6D3DF2]/30 flex items-center justify-center group-hover:bg-[#6D3DF2]/25 transition-all">
                      <Upload className="w-6 h-6 text-[#A78BFA]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-300">Clique para selecionar a foto</p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG ou WEBP — máx. 5MB</p>
                    </div>
                  </div>
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={fotoPreview}
                    alt="Preview da foto"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-red-500/80 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                    <p className="text-xs text-slate-300 truncate">{fotoFile?.name}</p>
                  </div>
                </div>
              )}

              {!fotoPreview && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-amber-400">
                    A foto é obrigatória para prosseguir com o pagamento.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 6 — Termo */}
          {step === 6 && (
            <div className="space-y-5">
              <TermoAceiteInscricao
                accepted={formData.termoAceito}
                onAcceptedChange={(accepted) => {
                  set("termoAceito", accepted);
                  if (accepted) setError("");
                }}
              />
            </div>
          )}

          {/* Step 7 — Revisão e Pagamento */}
          {step === 7 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Revisão e Pagamento
              </h2>

              <div className="space-y-3">
                <ReviewSection title="Dados Pessoais">
                  <ReviewRow label="Nome" value={formData.nomeCompleto} />
                  <ReviewRow
                    label="Preferido"
                    value={formData.nomePreferido}
                  />
                  <ReviewRow
                    label="Nascimento"
                    value={formData.dataNascimento}
                  />
                  <ReviewRow label="E-mail" value={formData.emailEncontrista} />
                  <ReviewRow label="WhatsApp" value={formData.whatsapp} />
                  <ReviewRow label="Religião" value={formData.religiao} />
                </ReviewSection>

                <ReviewSection title="Endereço">
                  <ReviewRow
                    label="Endereço"
                    value={`${formData.logradouro}, ${formData.numero} — ${formData.bairro}`}
                  />
                  <ReviewRow
                    label="Cidade/Estado"
                    value={`${formData.cidade} / ${formData.estado}`}
                  />
                </ReviewSection>

                <ReviewSection title="Saúde">
                  <ReviewRow
                    label="Alergia a medicamentos"
                    value={formData.alergicoMedicamentos ? "Sim" : "Não"}
                  />
                  {formData.alergicoMedicamentos && (
                    <>
                      <ReviewRow
                        label="Alergias"
                        value={formData.medicamentosAlergia || "—"}
                      />
                      <ReviewRow
                        label="Medicamentos"
                        value={formData.medicamentosEspecificos || "—"}
                      />
                    </>
                  )}
                  <ReviewRow
                    label="Dieta especial"
                    value={formData.possuiDietaEspecial ? "Sim" : "Não"}
                  />
                  {formData.possuiDietaEspecial && (
                    <ReviewRow
                      label="Dieta"
                      value={formData.dietaEspecial || "—"}
                    />
                  )}
                  <ReviewRow
                    label="Acessibilidade ou apoio"
                    value={formData.possuiNecessidadeEspecifica ? "Sim" : "Não"}
                  />
                  {formData.possuiNecessidadeEspecifica && (
                    <ReviewRow
                      label="Apoio necessário"
                      value={formData.necessidadeEspecifica || "—"}
                    />
                  )}
                </ReviewSection>

                <ReviewSection title="Padrinho / Madrinha">
                  <ReviewRow label="Nome" value={formData.nomePadrinho} />
                  <ReviewRow
                    label="WhatsApp"
                    value={formData.whatsappPadrinho}
                  />
                </ReviewSection>

                {fotoPreview && (
                  <ReviewSection title="Foto">
                    <div className="px-4 py-3">
                      <img
                        src={fotoPreview}
                        alt="Foto do encontrista"
                        className="w-24 h-24 object-cover rounded-xl border border-white/10"
                      />
                    </div>
                  </ReviewSection>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.termoAceito}
                className="w-full h-12 text-base bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </span>
                ) : (
                  "Confirmar e Pagar Inscrição"
                )}
              </Button>
            </div>
          )}

          {/* Navegação steps 1-4 */}
          {step < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="gap-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="gap-1 bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-6"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navegação step 5 — a foto é revisada antes da confirmação final */}
          {step === 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setStep(4)}
                className="gap-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => {
                  setError("");
                  setStep(6);
                }}
                disabled={!fotoFile}
                className="gap-1 bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-6 disabled:opacity-40"
              >
                Ler o termo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navegação step 6 — aceite obrigatório antes do pagamento */}
          {step === 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setStep(5)}
                className="gap-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => setStep(7)}
                disabled={!canAdvance}
                className="gap-1 bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-6 disabled:opacity-40"
              >
                Ir para pagamento
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Navegação step 7 — revisão e pagamento */}
          {step === 7 && (
            <div className="flex justify-start mt-6 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setStep(6)}
                className="gap-1 text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          EJC Eunápolis · Seus dados estão protegidos
        </p>
      </div>
    </div>
  );
}

// ─── Componentes de revisão ───────────────────────────────────────────────────
function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-white/[0.03] px-4 py-2 border-b border-white/10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}


