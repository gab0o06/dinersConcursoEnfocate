/**
 * Transacciones simuladas para la demo de EcoClub Diners
 *
 * Representan un mes típico de un usuario de Quito que usa el Metro,
 * va al gimnasio, compra en supermercado y tiene una gasolinera ocasional.
 * Los MCCs son reales y procesables por el motor de scoring.
 */

export interface RawTransaction {
  id: string;
  date: Date;
  merchant: string;
  mcc: number;
  amount: number;
  city: string;
}

const now = new Date();
const thisMonth = (dayOffset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - dayOffset);
  return d;
};

export const MOCK_TRANSACTIONS: RawTransaction[] = [
  // --- Metro de Quito (MCC 4111) ---
  {
    id: "tx-001",
    date: thisMonth(28),
    merchant: "Metro de Quito - Recarga",
    mcc: 4111,
    amount: 5.0,
    city: "Quito",
  },
  {
    id: "tx-002",
    date: thisMonth(21),
    merchant: "Metro de Quito - Recarga",
    mcc: 4111,
    amount: 5.0,
    city: "Quito",
  },
  {
    id: "tx-003",
    date: thisMonth(14),
    merchant: "Metro de Quito - Recarga",
    mcc: 4111,
    amount: 5.0,
    city: "Quito",
  },
  {
    id: "tx-004",
    date: thisMonth(7),
    merchant: "Metro de Quito - Recarga",
    mcc: 4111,
    amount: 5.0,
    city: "Quito",
  },
  // --- Gimnasio (MCC 7941) ---
  {
    id: "tx-005",
    date: thisMonth(25),
    merchant: "Smart Fit Quito Norte",
    mcc: 7941,
    amount: 35.0,
    city: "Quito",
  },
  // --- Supermercado (MCC 5411) ---
  {
    id: "tx-006",
    date: thisMonth(22),
    merchant: "Supermaxi El Jardín",
    mcc: 5411,
    amount: 67.5,
    city: "Quito",
  },
  {
    id: "tx-007",
    date: thisMonth(8),
    merchant: "Supermaxi CCI",
    mcc: 5411,
    amount: 54.2,
    city: "Quito",
  },
  // --- Eco-aliados (MCC 5999) — 3× puntos ---
  {
    id: "tx-008",
    date: thisMonth(18),
    merchant: "Tienda Granel Sustentable",
    mcc: 5999,
    amount: 22.0,
    city: "Quito",
  },
  {
    id: "tx-009",
    date: thisMonth(5),
    merchant: "Taller Bici Quito Verde",
    mcc: 5999,
    amount: 18.0,
    city: "Quito",
  },
  // --- Restaurantes (MCC 5812) ---
  {
    id: "tx-010",
    date: thisMonth(20),
    merchant: "Hasta La Vuelta Señor",
    mcc: 5812,
    amount: 14.5,
    city: "Quito",
  },
  {
    id: "tx-011",
    date: thisMonth(12),
    merchant: "El Español Restaurante",
    mcc: 5812,
    amount: 23.0,
    city: "Quito",
  },
  // --- Gasolinera (MCC 5541) — sin bonus verde ---
  {
    id: "tx-012",
    date: thisMonth(15),
    merchant: "Petroecuador Av. Eloy Alfaro",
    mcc: 5541,
    amount: 30.0,
    city: "Quito",
  },
];

/**
 * Transacciones del mes anterior (para comparativa de historial)
 */
export const MOCK_TRANSACTIONS_PREV_MONTH: RawTransaction[] = [
  {
    id: "tx-p001",
    date: thisMonth(45),
    merchant: "Metro de Quito - Recarga",
    mcc: 4111,
    amount: 5.0,
    city: "Quito",
  },
  {
    id: "tx-p002",
    date: thisMonth(38),
    merchant: "Smart Fit Quito Norte",
    mcc: 7941,
    amount: 35.0,
    city: "Quito",
  },
  {
    id: "tx-p003",
    date: thisMonth(35),
    merchant: "Supermaxi El Jardín",
    mcc: 5411,
    amount: 58.0,
    city: "Quito",
  },
  {
    id: "tx-p004",
    date: thisMonth(33),
    merchant: "Petroecuador Av. América",
    mcc: 5541,
    amount: 45.0,
    city: "Quito",
  },
  {
    id: "tx-p005",
    date: thisMonth(30),
    merchant: "El Español Restaurante",
    mcc: 5812,
    amount: 19.5,
    city: "Quito",
  },
];
