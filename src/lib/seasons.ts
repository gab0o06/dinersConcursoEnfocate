/**
 * seasons.ts — Temporadas configurables para EcoClub Diners
 *
 * Permite configurar campañas con multiplicadores MCC, retos especiales
 * y banners, todo desde un JSON externo sin re-deploy.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Season {
  /** Identificador único de la temporada */
  id: string;
  /** Nombre legible de la temporada */
  nombre: string;
  /** Fecha de inicio (ISO date string: YYYY-MM-DD) */
  inicio: string;
  /** Fecha de fin (ISO date string: YYYY-MM-DD) */
  fin: string;
  /** Multiplicadores de puntos por MCC: { mcc: multiplicador } */
  multiplicadoresMcc: Record<number, number>;
  /** Retos especiales activos durante la temporada */
  retosEspeciales: Array<{ id: string; nombre: string; ptsMeta: number }>;
  /** Configuración del banner en la app */
  banner: { titulo: string; descripcion: string; color: string };
  /** ¿Habilita ranking grupal entre usuarios? */
  rankingGrupal: boolean;
}

// ---------------------------------------------------------------------------
// Funciones públicas
// ---------------------------------------------------------------------------

/**
 * Valida y parsea un JSON de temporada (formato desconocido en runtime).
 * Retorna null si el JSON no tiene la forma esperada.
 */
export function parseSeasonConfig(json: unknown): Season | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;

  const obj = json as Record<string, unknown>;

  // Campos requeridos de tipo string
  if (
    typeof obj.id !== 'string' ||
    typeof obj.nombre !== 'string' ||
    typeof obj.inicio !== 'string' ||
    typeof obj.fin !== 'string'
  ) {
    return null;
  }

  // multiplicadoresMcc: objeto plano con claves numéricas y valores numéricos
  if (!obj.multiplicadoresMcc || typeof obj.multiplicadoresMcc !== 'object' || Array.isArray(obj.multiplicadoresMcc)) {
    return null;
  }
  const multiplicadoresMcc: Record<number, number> = {};
  for (const [key, val] of Object.entries(obj.multiplicadoresMcc as Record<string, unknown>)) {
    const mcc = Number(key);
    if (!Number.isFinite(mcc) || typeof val !== 'number') return null;
    multiplicadoresMcc[mcc] = val;
  }

  // retosEspeciales: array de objetos con id, nombre, ptsMeta
  if (!Array.isArray(obj.retosEspeciales)) return null;
  const retosEspeciales: Array<{ id: string; nombre: string; ptsMeta: number }> = [];
  for (const reto of obj.retosEspeciales) {
    if (
      !reto ||
      typeof reto !== 'object' ||
      typeof reto.id !== 'string' ||
      typeof reto.nombre !== 'string' ||
      typeof reto.ptsMeta !== 'number'
    ) {
      return null;
    }
    retosEspeciales.push({ id: reto.id, nombre: reto.nombre, ptsMeta: reto.ptsMeta });
  }

  // banner: objeto con titulo, descripcion y color
  if (
    !obj.banner ||
    typeof obj.banner !== 'object' ||
    Array.isArray(obj.banner)
  ) {
    return null;
  }
  const bannerObj = obj.banner as Record<string, unknown>;
  if (
    typeof bannerObj.titulo !== 'string' ||
    typeof bannerObj.descripcion !== 'string' ||
    typeof bannerObj.color !== 'string'
  ) {
    return null;
  }

  // rankingGrupal: boolean
  if (typeof obj.rankingGrupal !== 'boolean') return null;

  return {
    id: obj.id,
    nombre: obj.nombre,
    inicio: obj.inicio,
    fin: obj.fin,
    multiplicadoresMcc,
    retosEspeciales,
    banner: {
      titulo: bannerObj.titulo,
      descripcion: bannerObj.descripcion,
      color: bannerObj.color,
    },
    rankingGrupal: obj.rankingGrupal,
  };
}

/**
 * Retorna la temporada activa dado el timestamp actual.
 * Si hay múltiples activas, retorna la primera que coincida.
 * Retorna null si ninguna temporada está vigente.
 */
export function getActiveSeason(seasons: Season[], now: Date = new Date()): Season | null {
  const today = now.getTime();

  for (const season of seasons) {
    const start = new Date(season.inicio).getTime();
    // Fin: inclusive hasta el final del día
    const end = new Date(season.fin);
    end.setHours(23, 59, 59, 999);

    if (today >= start && today <= end.getTime()) {
      return season;
    }
  }

  return null;
}

/**
 * Aplica el multiplicador de temporada a los puntos base de una transacción MCC.
 * Si no hay temporada activa o el MCC no tiene multiplicador, retorna basePoints.
 */
export function applySeasonMultiplier(
  basePoints: number,
  mcc: number,
  season: Season | null,
): number {
  if (!season) return basePoints;

  const multiplier = season.multiplicadoresMcc[mcc];
  if (multiplier === undefined || multiplier === null) return basePoints;

  return Math.floor(basePoints * multiplier);
}
