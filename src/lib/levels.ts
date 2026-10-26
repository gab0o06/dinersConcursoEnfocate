/**
 * levels.ts — Sistema de niveles EcoClub basado en días activos consecutivos
 *
 * Un "mes activo" = el usuario completó al menos 1 reto en ese mes calendario.
 * Los niveles escalan por días activos acumulados; la degradación es gradual
 * (1 escalón por cada 2 meses consecutivos de inactividad).
 *
 * Orden de niveles: descubierto → activado → constante → verde → guardian
 */

import { ECOCLUB, type NivelEcoClub } from '../config/ecoclub.config';

// ---------------------------------------------------------------------------
// Orden canónico de niveles (de menor a mayor)
// ---------------------------------------------------------------------------

const NIVEL_ORDER: NivelEcoClub[] = [
  'descubierto',
  'activado',
  'constante',
  'verde',
  'guardian',
];

const NIVEL_LABELS: Record<NivelEcoClub, string> = {
  descubierto: 'Descubierto',
  activado: 'Activado',
  constante: 'Constante',
  verde: 'Verde',
  guardian: 'Guardián',
};

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface LevelState {
  /** Nivel actual del usuario */
  nivel: NivelEcoClub;
  /** Días activos consecutivos acumulados */
  diasActivos: number;
  /** ¿El usuario completó al menos un reto este mes? */
  mesActivoActual: boolean;
  /** Porcentaje de comisión disponible para canje en este nivel */
  topePct: number;
  /** Siguiente nivel (null si ya está en guardian) */
  siguienteNivel: NivelEcoClub | null;
  /** Días activos que faltan para subir de nivel (null si ya está en guardian) */
  diasParaSiguienteNivel: number | null;
}

// ---------------------------------------------------------------------------
// Funciones públicas
// ---------------------------------------------------------------------------

/**
 * Calcula el nivel actual basado en días activos consecutivos.
 * Siempre retorna el nivel más alto que los días activos respaldan.
 */
export function calculateLevel(diasActivos: number): NivelEcoClub {
  // Recorre los niveles de mayor a menor para encontrar el primero que califica
  const niveles = [...NIVEL_ORDER].reverse() as NivelEcoClub[];

  for (const nivel of niveles) {
    const diasReq = ECOCLUB.diasParaNivel[nivel as keyof typeof ECOCLUB.diasParaNivel];
    if (diasActivos >= diasReq) {
      return nivel;
    }
  }

  // Fallback: siempre al menos "activado" (nivel base al registrarse)
  return 'activado';
}

/**
 * Calcula el estado completo del nivel del usuario.
 */
export function getLevelState(
  diasActivos: number,
  mesActivoActual: boolean,
): LevelState {
  const nivel = calculateLevel(diasActivos);
  const topePct = ECOCLUB.topePctPorNivel[nivel];

  const nivelIndex = NIVEL_ORDER.indexOf(nivel);
  const siguienteNivel: NivelEcoClub | null =
    nivelIndex < NIVEL_ORDER.length - 1
      ? NIVEL_ORDER[nivelIndex + 1]
      : null;

  let diasParaSiguienteNivel: number | null = null;
  if (siguienteNivel !== null) {
    const diasReqSiguiente =
      ECOCLUB.diasParaNivel[siguienteNivel as keyof typeof ECOCLUB.diasParaNivel];
    diasParaSiguienteNivel = Math.max(0, diasReqSiguiente - diasActivos);
  }

  return {
    nivel,
    diasActivos,
    mesActivoActual,
    topePct,
    siguienteNivel,
    diasParaSiguienteNivel,
  };
}

/**
 * Aplica degradación gradual de nivel:
 * baja 1 escalón por cada 2 meses consecutivos de inactividad.
 * Nunca sube, solo mantiene o baja.
 */
export function applyLevelDegradation(
  nivel: NivelEcoClub,
  mesesInactivos: number,
): NivelEcoClub {
  if (mesesInactivos <= 0) return nivel;

  // Cuántos escalones bajar (1 por cada 2 meses inactivos, redondeado hacia abajo)
  const escalonesBajar = Math.floor(mesesInactivos / 2);
  if (escalonesBajar === 0) return nivel;

  const nivelIndex = NIVEL_ORDER.indexOf(nivel);
  const nuevoIndex = Math.max(0, nivelIndex - escalonesBajar);

  return NIVEL_ORDER[nuevoIndex];
}

/**
 * Retorna la etiqueta de display (capitalizada, en español) del nivel.
 */
export function getLevelLabel(nivel: NivelEcoClub): string {
  return NIVEL_LABELS[nivel];
}
