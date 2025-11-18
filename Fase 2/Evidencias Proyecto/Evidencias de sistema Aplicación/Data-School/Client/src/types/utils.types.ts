// Tipos utilitarios generales del sistema
import comunas from '@/assets/data/comunas.json';

export interface Nivel {
  id: number
  numero: number
  nivel: 'Pre-Kinder' | 'Kinder' | 'Basico' | 'Medio'
  display: string // Ej: "Pre-Kinder", "1° Basico", "3° Medio"
}

export type TipoNivel = 'Pre-Kinder' | 'Kinder' | 'Basico' | 'Medio'

export interface Regiones {
  name: string
  romanNumber: string
  number: string
  id: string
  communes: Comuna[]
}

export interface Comuna {
  name: string
  id: string
}

export const regiones: Regiones[] = (() => {
  const raw = comunas as unknown;

  // If the JSON is already an array of regions
  if (Array.isArray(raw)) {
    return raw as Regiones[];
  }

  // If the JSON is an object with a 'regions' property (some files use { name, regions: [...] })
  if ((raw as any)?.regions && Array.isArray((raw as any).regions)) {
    return (raw as any).regions as Regiones[];
  }

  // Fallback: coerce whatever shape into Regiones[]
  return (raw as any) as Regiones[];
})();

export const comunasList: Comuna[] = regiones.flatMap(region => region.communes);

export const comunaByRegion = (regionName: string): Comuna[] => {
  const region = regiones.find(r => r.name === regionName);
  return region ? region.communes : [];
}