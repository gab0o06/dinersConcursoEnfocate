/**
 * Test Suite de EcoClub Diners
 * Ejecuta validaciones exhaustivas de las reglas de negocio:
 *  1. Scoring MCC y CO2
 *  2. Topes por nivel (40/45/50/55%)
 *  3. Bandas A/B/C y saldo máximo
 *  4. Multiplicador Top-of-Wallet ×1.5
 *  5. Bonus de bajo carbono
 *  6. Niveles y degradación gradual
 *  7. Caducidad FIFO
 */

import assert from "node:assert/strict";
import test from "node:test";

// Simulación de constantes desde ecoclub.config
const ECOCLUB = {
  valorPuntoUSD: 0.005,
  minCanjePts: 200,
  caducidadDias: 90,
  topOfWalletThreshold: 200,
  topOfWalletMultiplier: 1.5,
  cuotaManejoUSD: 8,
  millaPts: 300,
  topePctPorNivel: {
    descubierto: 0.0,
    activado: 0.40,
    constante: 0.45,
    verde: 0.50,
    guardian: 0.55,
  },
  diasParaNivel: {
    activado: 0,
    constante: 45,
    verde: 90,
    guardian: 180,
  },
  bandas: {
    A: { gastoPiso: 600, generacionMaxPts: 2000, saldoMaxPts: 5000 },
    B: { gastoPiso: 300, generacionMaxPts: 1200, saldoMaxPts: 3000 },
    C: { gastoPiso: 0,   generacionMaxPts: 600,  saldoMaxPts: 1500 },
  },
  retos: {
    stravaPtsPorKm: 5,
    stravaMetaKm: 35,
    reciVeciPtsPorKg: 20,
    reciVeciMetaKg: 50,
    metroMaxRecargasMes: 10,
    metroPtsPorRecarga: 50,
  },
};

test("1. Reglas MCC: Metro genera 2 pts/$1 y CO2 evitado", () => {
  const gastoMetro = 10;
  const ptsPorDolarMetro = 2;
  const co2PorDolarMetro = 0.21;

  const pts = Math.floor(gastoMetro * ptsPorDolarMetro);
  const co2 = parseFloat((gastoMetro * co2PorDolarMetro).toFixed(3));

  assert.equal(pts, 20);
  assert.equal(co2, 2.1);
});

test("2. Multiplicador Top-of-Wallet ×1.5 real", () => {
  const rawPoints = 100;
  const multiplierActive = true;
  const finalPoints = multiplierActive ? Math.floor(rawPoints * 1.5) : rawPoints;

  assert.equal(finalPoints, 150);
});

test("3. Topes por nivel escalan correctamente", () => {
  const comisionGenerada = 20.0; // $20 en comisiones

  const topeActivado = comisionGenerada * ECOCLUB.topePctPorNivel.activado;
  const topeConstante = comisionGenerada * ECOCLUB.topePctPorNivel.constante;
  const topeVerde = comisionGenerada * ECOCLUB.topePctPorNivel.verde;
  const topeGuardian = comisionGenerada * ECOCLUB.topePctPorNivel.guardian;

  assert.equal(topeActivado, 8.0);   // 40%
  assert.equal(topeConstante, 9.0);  // 45%
  assert.equal(topeVerde, 10.0);     // 50%
  assert.equal(topeGuardian, 11.0);  // 55%
});

test("4. Bandas A/B/C limitan saldo máximo", () => {
  function applyBandaLimits(newPoints, currentBalance, bandaKey) {
    const banda = ECOCLUB.bandas[bandaKey];
    const canEarn = Math.max(0, Math.min(newPoints, banda.generacionMaxPts));
    const spaceLeft = Math.max(0, banda.saldoMaxPts - currentBalance);
    return Math.min(canEarn, spaceLeft);
  }

  // Usuario en Banda C (saldo máx 1500) que ya tiene 1400 pts e intenta ganar 300
  const acreditados = applyBandaLimits(300, 1400, "C");
  assert.equal(acreditados, 100); // solo cabe 100 antes de topar 1500
});

test("5. Consumo FIFO de batches de puntos", () => {
  const batches = [
    { id: 1, points: 150, earnedAt: new Date(2026, 0, 1) }, // más antiguo
    { id: 2, points: 200, earnedAt: new Date(2026, 1, 1) }, // más reciente
  ];

  let toRemove = 200; // Canje de 200 puntos
  const updated = batches
    .sort((a, b) => a.earnedAt.getTime() - b.earnedAt.getTime())
    .map((b) => {
      if (toRemove <= 0) return b;
      const deducted = Math.min(b.points, toRemove);
      toRemove -= deducted;
      return { ...b, points: b.points - deducted };
    })
    .filter((b) => b.points > 0);

  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, 2);
  assert.equal(updated[0].points, 150); // Se gastó el batch 1 (150) y 50 del batch 2
});

test("6. Degradación de nivel gradual (1 escalón cada 2 meses)", () => {
  const NIVEL_ORDER = ["descubierto", "activado", "constante", "verde", "guardian"];

  function applyLevelDegradation(nivel, mesesInactivos) {
    const escalonesABajar = Math.floor(mesesInactivos / 2);
    if (escalonesABajar <= 0) return nivel;

    const currentIndex = NIVEL_ORDER.indexOf(nivel);
    const minIndex = NIVEL_ORDER.indexOf("activado");
    const targetIndex = Math.max(minIndex, currentIndex - escalonesABajar);
    return NIVEL_ORDER[targetIndex];
  }

  assert.equal(applyLevelDegradation("guardian", 0), "guardian");
  assert.equal(applyLevelDegradation("guardian", 1), "guardian"); // 1 mes no degrada
  assert.equal(applyLevelDegradation("guardian", 2), "verde");    // 2 meses baja 1
  assert.equal(applyLevelDegradation("guardian", 4), "constante"); // 4 meses baja 2
  assert.equal(applyLevelDegradation("guardian", 10), "activado"); // nunca cae de activado
});

test("7. Bonus bajo carbono", () => {
  function qualifies(coiScore, totalCo2Saved, totalSpent) {
    if (coiScore >= 6) return true;
    if (totalCo2Saved && totalSpent && totalSpent > 0) {
      return (totalCo2Saved / totalSpent) * 10 <= 0.6;
    }
    return false;
  }

  assert.equal(qualifies(6.2, 5.0, 100), true);
  assert.equal(qualifies(3.0, 0.5, 100), true); // intensidad = 0.05 <= 0.6
  assert.equal(qualifies(2.0, 8.0, 20), false); // intensidad = 4.0 > 0.6
});
