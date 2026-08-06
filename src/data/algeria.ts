import algeriaData from "./algeria.json";

export interface Dayra {
  name: string;
  communes: string[];
}

export interface Wilaya {
  number: number;
  name: string;
  dairas: Dayra[];
}

// The JSON source is trusted to match this shape; cast to keep the consumers typed.
export const wilayas = algeriaData as Wilaya[];

const sameText = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** All wilaya names in data order (select options). */
export function getWilayaNames(): string[] {
  return wilayas.map((w) => w.name);
}

/** Dayra names of a wilaya (case-insensitive match), or [] if unknown. */
export function getDayras(wilayaName: string): string[] {
  const wilaya = wilayas.find((w) => sameText(w.name, wilayaName));
  return wilaya ? wilaya.dairas.map((d) => d.name) : [];
}

/** Commune names of a dayra (case-insensitive match), or [] if unknown. */
export function getBaladiyas(wilayaName: string, dayraName: string): string[] {
  const wilaya = wilayas.find((w) => sameText(w.name, wilayaName));
  if (!wilaya) return [];
  const dayra = wilaya.dairas.find((d) => sameText(d.name, dayraName));
  return dayra ? dayra.communes : [];
}

/** True only when all three values exist in the data (case-insensitive). */
export function isKnownLocation(
  wilaya: string,
  dayra: string,
  baladiya: string
): boolean {
  return (
    getDayras(wilaya).length > 0 &&
    getBaladiyas(wilaya, dayra).some((b) => sameText(b, baladiya))
  );
}
