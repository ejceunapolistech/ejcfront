import {
  Guitar, Handshake, Cookie, Drama, TrafficCone, UtensilsCrossed, Ban,
  HandHeart, ShoppingCart, Camera, ConciergeBell, ChefHat, Users, ClipboardList,
  PackageOpen, Flower2, ListOrdered, Soup, type LucideIcon,
} from "lucide-react";

export interface TeamInfo {
  label: string;
  icon: LucideIcon;
}

export const TEAM_MAP: Record<string, TeamInfo> = {
  // Equipe de Frente
  BANDINHA:    { label: "Bandinha",    icon: Guitar },
  BOA_VONTADE: { label: "Boa Vontade", icon: Handshake },
  BISCOITO:    { label: "Biscoito",    icon: Cookie },
  SOCIODRAMA:  { label: "Sociodrama",  icon: Drama },
  TRANSITO:    { label: "Trânsito",    icon: TrafficCone },
  GARCONS:     { label: "Garçons",     icon: UtensilsCrossed },
  // Equipe de Fundo
  ORACAO:      { label: "Oração",      icon: HandHeart },
  ORDERM:      { label: "Ordem",       icon: ShoppingCart },
  MIDIA:       { label: "Mídia",       icon: Camera },
  RECEPCAO:    { label: "Recepção",    icon: ConciergeBell },
  COZINHA:     { label: "Cozinha",     icon: ChefHat },
  CIRCULO:     { label: "Círculo",     icon: Users },
  SECRETARIA:  { label: "Secretaria",  icon: ClipboardList },
  APOIO:       { label: "Apoio",       icon: PackageOpen },
  CERIMONIAL:  { label: "Cerimonial",  icon: Flower2 },
  ROTEIRO:     { label: "Roteiro",     icon: ListOrdered },
  REFEITORIO:  { label: "Refeitório",  icon: Soup },
  // Comum
  NAO_OPTAR:   { label: "Não Optar",   icon: Ban },
};

/** Strips NFD combining diacritics — maps "MÍDIA" → "MIDIA", "CÍRCULO" → "CIRCULO". */
function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
}

/** Lookup by backend enum code (handles accented variants) or display label. */
export function getTeamInfo(code: string): TeamInfo | null {
  if (!code) return null;
  const byCode = TEAM_MAP[stripAccents(code)];
  if (byCode) return byCode;
  // Fallback: match by display label (history API returns labels, not codes)
  const lc = code.trim().toLowerCase();
  for (const info of Object.values(TEAM_MAP)) {
    if (info.label.toLowerCase() === lc) return info;
  }
  return null;
}
