"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  CreditCard,
  Loader2,
  Camera,
  Upload,
  X,
} from "lucide-react";

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
  alergicoMedicamentos: boolean;
  medicamentosAlergia: string;
  medicamentosEspecificos: string;
  possuiDietaEspecial: boolean;
  dietaEspecial: string;
  nomePadrinho: string;
  whatsappPadrinho: string;
  circulo: string;
}

const STEPS = [
  { id: 1, label: "Dados Pessoais", icon: User },
  { id: 2, label: "Endereço", icon: MapPin },
  { id: 3, label: "Saúde", icon: HeartPulse },
  { id: 4, label: "Padrinho", icon: Users },
  { id: 5, label: "Foto", icon: Camera },
  { id: 6, label: "Pagamento", icon: CreditCard },
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
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ToggleCard({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-200
        ${checked ? "border-[#6D3DF2] bg-[#6D3DF2]/10" : "border-white/10 bg-[#101522] hover:border-white/20"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${checked ? "text-indigo-700" : "text-gray-700"}`}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${checked ? "border-[#6D3DF2] bg-[#6D3DF2]/100" : "border-gray-300"}`}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EncountersForm() {
  const params = useParams();
  const idEvento = params?.idEvento as string;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [idEncontristaCadastrado, setIdEncontristaCadastrado] = useState<string | null>(null);

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
    alergicoMedicamentos: false,
    medicamentosAlergia: "",
    medicamentosEspecificos: "",
    possuiDietaEspecial: false,
    dietaEspecial: "",
    nomePadrinho: "",
    whatsappPadrinho: "",
    circulo: "AZUL",
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

  const isStep3Valid = true; // saúde é opcional

  const isStep4Valid =
    formData.nomePadrinho.trim() !== "" &&
    formData.whatsappPadrinho.trim() !== "";

  const isStep5Valid = fotoFile !== null;

  const canAdvance =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid) ||
    (step === 4 && isStep4Valid) ||
    (step === 5 && isStep5Valid);

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

  // Step 5 → 6: cadastra o encontrista e faz upload da foto
  const handleAvancarParaPagamento = async () => {
    if (!fotoFile || !idEncontristaCadastrado) return;
    setUploadingFoto(true);
    setError("");
    try {
      const formDataFoto = new FormData();
      formDataFoto.append("foto", fotoFile);
      await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/encontrista/${idEncontristaCadastrado}/foto`,
        formDataFoto,
        { headers: { "Content-Type": "multipart/form-data", Accept: "*/*" } }
      );
      setStep(6);
    } catch (err) {
      setError("Erro ao enviar a foto. Tente novamente.");
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ejceunapolis/api/encontrista/${idEvento}`,
        formData,
        { headers: { "Content-Type": "application/json", Accept: "*/*" } }
      );
      const idEncontrista = response.data.idEncontrista;
      setIdEncontristaCadastrado(idEncontrista);

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
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-1">
                Informações de Saúde
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Essas informações são importantes para garantir seu bem-estar
                durante o evento.
              </p>

              <ToggleCard
                checked={formData.alergicoMedicamentos}
                onChange={(v) => set("alergicoMedicamentos", v)}
                label="Tenho alergia a medicamentos"
                description="Marque se você possui alguma alergia conhecida"
              />

              {formData.alergicoMedicamentos && (
                <div className="space-y-4 pl-2 border-l-2 border-rose-200">
                  <FormField label="Medicamentos com alergia">
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

              <ToggleCard
                checked={formData.possuiDietaEspecial}
                onChange={(v) => set("possuiDietaEspecial", v)}
                label="Possuo dieta especial"
                description="Vegetariano, intolerância alimentar, etc."
              />

              {formData.possuiDietaEspecial && (
                <div className="pl-2 border-l-2 border-amber-200">
                  <FormField label="Descreva sua dieta">
                    <Input
                      value={formData.dietaEspecial}
                      onChange={(e) => set("dietaEspecial", e.target.value)}
                      placeholder="Ex: Vegetariano, sem glúten..."
                    />
                  </FormField>
                </div>
              )}
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

          {/* Step 6 — Revisão e Pagamento */}
          {step === 6 && (
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
                disabled={loading}
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

          {/* Navegação step 5 — foto obrigatória, avança fazendo cadastro + upload */}
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
                onClick={handleSubmit}
                disabled={!fotoFile || loading}
                className="gap-1 bg-[#6D3DF2] hover:bg-[#5B2DD8] text-white rounded-xl px-6 disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <>
                    Confirmar e Pagar
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navegação step 6 — revisão, só voltar */}
          {step === 6 && (
            <div className="flex justify-start mt-6 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setStep(5)}
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


