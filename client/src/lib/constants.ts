// Team colors and styling
export const teamColors: Record<string, { bg: string; text: string; border: string }> = {
  "Palmeiras": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "Sao Paulo": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Cruzeiro": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Atletico MG": { bg: "bg-black/5", text: "text-gray-900", border: "border-gray-300" },
  "Internacional": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "Flamengo": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  "America MG": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  "Avai": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "TIME 9": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "TIME 10": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

// Position categories
export const positionCategories = {
  DEF: {
    label: "Defesa",
    positions: ["GK", "ZG", "LD", "LE"],
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-300",
  },
  MEI: {
    label: "Meio",
    positions: ["VOL", "MLG", "MAT"],
    color: "bg-amber-100 text-amber-800",
    borderColor: "border-amber-300",
  },
  ATA: {
    label: "Ataque",
    positions: ["PD", "PE", "CA", "ATA"],
    color: "bg-red-100 text-red-800",
    borderColor: "border-red-300",
  },
};

// Position details
export const positionDetails: Record<string, { label: string; sector: keyof typeof positionCategories }> = {
  GK: { label: "Goleiro", sector: "DEF" },
  ZG: { label: "Zagueiro", sector: "DEF" },
  LD: { label: "Lateral Direita", sector: "DEF" },
  LE: { label: "Lateral Esquerda", sector: "DEF" },
  VOL: { label: "Volante", sector: "MEI" },
  MLG: { label: "Meia", sector: "MEI" },
  MAT: { label: "Meia Atacante", sector: "MEI" },
  PD: { label: "Ponta Direita", sector: "ATA" },
  PE: { label: "Ponta Esquerda", sector: "ATA" },
  CA: { label: "Centroavante", sector: "ATA" },
  ATA: { label: "Atacante", sector: "ATA" },
};

// Get sector for a position
export function getSector(position: string): keyof typeof positionCategories {
  return positionDetails[position]?.sector || "DEF";
}

// Get category color for position
export function getPositionCategoryColor(position: string) {
  const sector = getSector(position);
  return positionCategories[sector];
}

// Formation types
export const formations = {
  "4-3-3": { GK: 1, DEF: 4, MEI: 3, ATA: 3, label: "4-3-3 (Clássico)" },
  "4-4-2": { GK: 1, DEF: 4, MEI: 4, ATA: 2, label: "4-4-2 (Equilibrado)" },
  "5-3-2": { GK: 1, DEF: 5, MEI: 3, ATA: 2, label: "5-3-2 (Defensivo)" },
  "3-5-2": { GK: 1, DEF: 3, MEI: 5, ATA: 2, label: "3-5-2 (Ofensivo)" },
};

export type FormationType = keyof typeof formations;

export const TEAM_BUILDING_BUDGET = 1000;
