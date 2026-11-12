/**
 * co2.ts — Utilidades de presentación para el CO₂ evitado.
 * La lógica de cálculo vive en services/mccScoring.ts.
 */

/** Convierte kg de CO₂ evitado a una equivalencia comprensible para el usuario */
export function co2ToEquivalence(co2Kg: number): string {
  if (co2Kg >= 6) return `plantar ${Math.round(co2Kg / 3)} árboles`;
  if (co2Kg >= 2) return `ahorrar ${Math.round(co2Kg * 0.5)} litros de gasolina`;
  return `evitar ${Math.round(co2Kg * 1000)}g de CO₂`;
}
