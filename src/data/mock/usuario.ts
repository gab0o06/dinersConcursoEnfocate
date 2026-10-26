/**
 * usuario.ts — Mock del usuario EcoClub para desarrollo y demos
 */

export interface MockUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  /** Últimos 4 dígitos de la tarjeta */
  numeroTarjeta: string;
  tipoTarjeta: string;
  /** Fecha de estado de cuenta (fecha de corte) */
  fechaCorte: Date;
  /** Días activos consecutivos acumulados */
  diasActivosConsecutivos: number;
  /** Meses consecutivos sin completar ningún reto */
  mesesInactivos: number;
}

export const MOCK_USUARIO: MockUsuario = {
  id: 'usr-001',
  nombre: 'Gabriel',
  apellido: 'Morales',
  email: 'gabriel.morales@email.com',
  numeroTarjeta: '2560',
  tipoTarjeta: 'DINERS CLUB MILES',
  fechaCorte: new Date(2026, 11, 1), // 01/dic/2026
  diasActivosConsecutivos: 52,
  mesesInactivos: 0,
};
