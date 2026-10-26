# EcoClub × Diners Club — Especificación unificada (v3 + v4)

> **Para el agente de código.** Este documento es la fuente de verdad de las reglas de negocio de EcoClub y el backlog para el repo (`dinersConcursoEnfocate`, Expo / React Native). Combina el documento v3 (modelo de costo variable) con el v4 (buyer personas, niveles, B2B, temporadas, límites) y **corrige inconsistencias entre ambos** (sección 7).
>
> Marcas: ✅ definido por el equipo · 🟡 propuesta con valor por defecto (ajustable) · ⚠️ pendiente de calibrar con datos reales de Diners.
>
> Regla general de implementación: **ningún número de negocio va dentro de un componente.** Todo vive en `src/config/ecoclub.config.ts` o en datos mock que simulen el back-office (ver sección 5).

---

## 1. Producto en una página

EcoClub es un módulo dentro de **BLU** (app de Diners Club Ecuador) que convierte acciones sostenibles cotidianas en **EcoPoints** canjeables por beneficios sobre productos que Diners ya tiene. El costo es **variable**: lo que un usuario puede canjear nunca supera un porcentaje de la comisión que ese mismo usuario generó.

**Público:** profesionales de 24–40 años en Quito, con tarjeta Diners activa y gastos recurrentes fuera de Diners.

**Tres capas:**

| Capa                  | Qué hace                                                          | ¿Requiere acción del usuario?         |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| 0 · Medición pasiva   | Score de CO₂ calculado desde el MCC de cada transacción Diners    | No (100% de tarjetahabientes activos) |
| 1 · Retos activos     | ReciVeci (reciclaje), Metro Diners (recargas), Km Verdes (Strava) | Sí, voluntario                        |
| 2 · Canje y comunidad | Canje en BLU, temporadas, equipos, mapa de eco-aliados            | Sí, tras registrarse                  |

La capa 0 es el **anzuelo de adquisición**: el usuario ve su huella en BLU _antes_ de registrarse en EcoClub.

---

## 2. Reglas de negocio

### 2.1 Niveles (miden comportamiento, no gasto) ✅

| Nivel          | Cómo se llega                       | Qué desbloquea                                                                    | Tope de canje (% de comisión del mes) |
| -------------- | ----------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| 🔍 Descubierto | Automático (tarjetahabiente activo) | Score MCC visible en BLU, solo lectura, gancho hacia EcoClub                      | — (no canjea)                         |
| 🌱 Activado    | Registro en EcoClub                 | Puntos retroactivos del mes en curso, 3 retos, mapa de eco-aliados desde el día 1 | 40%                                   |
| 🌿 Constante   | 1,5 meses activos consecutivos      | Temporadas especiales                                                             | 45%                                   |
| 🌳 Verde       | 3 meses activos consecutivos        | Crédito a cuota de manejo, badge en perfil BLU                                    | 50%                                   |
| 🌍 Guardián    | 6 meses activos consecutivos        | Conversión a millas, experiencias exclusivas, ranking nacional                    | 55%                                   |

Reglas de implementación 🟡:

- Implementar los umbrales en **días** (45 / 90 / 180) para evitar meses fraccionarios.
- "Mes activo" = al menos 1 reto completado en el mes calendario.
- El nivel **baja de a un escalón** si el usuario está inactivo 2 meses seguidos; nunca cae de golpe.
- El mapa de eco-aliados es visible para todo usuario `Activado+`. El nivel no restringe el mapa.

### 2.2 MCC scoring (capa 0) ✅ / ⚠️

`CO₂ (kg) = monto × factorCO₂ / 10` · `puntosBase = monto × ptsPorDólar`

| MCC  | Tipo de comercio              | Factor CO₂ (kg por $10) | Pts por $1 | Comisión real                        |
| ---- | ----------------------------- | ----------------------- | ---------- | ------------------------------------ |
| 5541 | Gasolineras                   | 2,3                     | 0,5        | ⚠️ por calibrar                      |
| 5812 | Restaurantes                  | 1,1                     | 1          | ⚠️ por calibrar                      |
| 5411 | Supermercados                 | 0,8                     | 1          | ⚠️ por calibrar                      |
| 4111 | Transporte público (Metro)    | 0,1                     | 2          | ⚠️ por calibrar                      |
| 7941 | Gimnasios / clubes deportivos | 0                       | 2          | ⚠️ por calibrar                      |
| 5999 | Comercios eco-aliados         | 0,05                    | 3          | ⚠️ por calibrar (+ fee del comercio) |

- Los factores de CO₂ son ilustrativos; la Ing. Ambiental los calibra con IPCC / datos de Quito. Deben ser configurables, no constantes en código.
- **Comisión efectiva:** cada transacción genera `monto × tasaInterchange[mcc]`. Hasta tener datos de Diners, usar `0.02` plano para todos los MCC como valor de prueba (`tasaInterchange` configurable por MCC). El Metro (4111) probablemente rinde menos que 2%; el diseño debe soportar tasas distintas por MCC desde el inicio.

### 2.3 Acumulación de EcoPoints 🟡

| Fuente                                | Puntos                                                                                       | Verificación                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Cualquier transacción Diners elegible | `monto × ptsPorDólar[mcc]`                                                                   | MCC (automático)                                                          |
| Reto ReciVeci                         | 20 pts / kg reciclado                                                                        | Confirmación de ReciVeci (ReciApp)                                        |
| Reto Km Verdes                        | 5 pts / km                                                                                   | API Strava (GPS)                                                          |
| Reto Metro Diners                     | +50 pts por recarga con Diners (bonus sobre el base MCC), máx. 10 recargas bonificadas / mes | MCC 4111                                                                  |
| Bonus mensual bajo carbono            | +100 pts                                                                                     | Intensidad de CO₂ del mes ≤ umbral configurable (default: 0,6 kg por $10) |

Todo el flujo de acumulación está sujeto a la **generación máxima mensual** de la banda del usuario (2.6). Los puntos base MCC y los bonus de retos son **aditivos** (no sustituyen uno al otro).

### 2.4 Conversión, canje y caducidad ✅

- **100 pts = $0,50** (`valorPuntoUSD = 0.005`).
- **Mínimo por canje:** 200 pts ($1,00).
- **Caducidad:** 90 días desde que se generó el punto (consumo FIFO).
- **Tope mensual de canje:** `topePct[nivel] × comisiónEfectivaDelMes` (2.1).
- **Disponible para canjear** (lo que se muestra en BLU): `min(saldoVigente, topeMensualEnPts − canjeadoEnElMes)`.
  Mostrar siempre este valor **separado** del saldo total, para no crear "puntos vacíos" que el usuario no puede usar.

| Canje                               | Desde nivel | Regla                                                                                                                           |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Descuento en factura (eco-cashback) | Activado    | Se aplica en la pantalla de pago de BLU: "Tienes X pts = $Y".                                                                   |
| Crédito a cuota de manejo           | Verde       | Descuento parcial hasta el tope disponible. Cobertura total solo si el tope mensual ≥ cuota (⚠️ cuota supuesta $8).             |
| Conversión a millas Diners          | Guardián    | 300 pts = 1 milla, acreditada al programa existente.                                                                            |
| Bono predial                        | Activado    | Hasta $50, solo si la **comisión histórica acumulada ≥ $100**; se paga canjeando dentro de BLU y pagando el predial con Diners. |
| Comercio eco-aliado                 | Activado    | El usuario genera un QR en BLU y paga con Diners en el comercio; sin transacción Diners no hay descuento.                       |

> No hay saldo fijo del Metro: la recarga ya genera puntos por MCC 4111 (era doble recompensa).

### 2.5 Top of Wallet y activación ✅ / 🟡

- Umbral: **$200/mes** en transacciones Diners **o** ≥ 2 débitos automáticos recurrentes → habilita multiplicadores de puntos base (⚠️ factor por definir; default `1.5`). El multiplicador sube la generación, **no** el tope de canje.
- UI: indicador "$150 / $200 para activar tu multiplicador" en MenuEco.
- Push semanal (jueves, máx. 1 por semana) cuando el gasto del mes está entre el 70% y el 100% del umbral: "Te faltan $X esta semana…".
- Sugerencia de autorecarga: si el usuario tiene ≥ 1 recarga MCC 4111 con Diners en 30 días pero menos de 4, sugerir activar autorecarga con Diners. (No es posible detectar recargas en efectivo: no aparecen en datos de Diners. Ver sección 7.)

### 2.6 Límites por rango de usuario (bandas) 🟡

Banda según **gasto mensual promedio con Diners, últimos 3 meses**: A < $300 · B $300–599 · C ≥ $600. Valores calculados con comisión 2% y tope 40%.

|                                              | Banda A (Ana)   | Banda B (Diego) | Banda C (Valeria) |
| -------------------------------------------- | --------------- | --------------- | ----------------- |
| Gasto de referencia                          | $200/mes        | $400/mes        | $800/mes          |
| Comisión / mes                               | $4              | $8              | $16               |
| Tope canje / mes — Activado (40%)            | $1,60 (320 pts) | $3,20 (640 pts) | $6,40 (1.280 pts) |
| Tope canje / mes — Constante (45%)           | $1,80           | $3,60           | $7,20             |
| Tope canje / mes — Verde (50%)               | $2,00           | $4,00           | $8,00             |
| Tope canje / mes — Guardián (55%)            | $2,20           | $4,40           | $8,80             |
| Generación máx. / mes                        | 300 pts         | 600 pts         | 1.200 pts         |
| Saldo máx. acumulado (3 meses de generación) | 900 pts         | 1.800 pts       | 3.600 pts         |
| Cobertura de cuota de manejo ($8) en Verde   | 25%             | 50%             | 100%              |
| Bono predial (comisión histórica $100)       | ~25 meses       | ~13 meses       | ~6 meses          |

- Al llegar al saldo máximo, los puntos nuevos **no se acreditan** hasta que el usuario canjee o venzan puntos.
- La banda se recalcula mensualmente; cambiar de banda no destruye saldo, solo cambia topes.

### 2.7 Temporadas (configurables desde back-office) ✅

El objetivo: lanzar campañas sin publicar una nueva versión de la app. La app **solo renderiza** lo que entrega el back-office.

```json
{
  "id": "2026-q4-verde",
  "nombre": "Temporada Verde Q4",
  "inicio": "2026-10-01",
  "fin": "2026-12-31",
  "retosEspeciales": [
    {
      "id": "reci-5kg",
      "tipo": "reciclaje_kg",
      "meta": 5,
      "periodo": "semana",
      "bonusPts": 200
    }
  ],
  "multiplicadores": [
    {
      "alcance": "mcc",
      "valor": "4111",
      "factor": 2,
      "desde": "2026-11-01",
      "hasta": "2026-11-30"
    }
  ],
  "premio": {
    "tipo": "experiencia",
    "descripcion": "Experiencia verde en Quito",
    "valorUSD": null
  },
  "competencia": {
    "tipo": "grupal",
    "tamanoMaxEquipo": 10,
    "tiposGrupo": ["empresa", "universidad", "barrio", "familia"]
  }
}
```

Configurable sin deploy: nombre, fechas, metas numéricas de retos, multiplicadores (por MCC o por reto), premio, tipo de competencia, grupos. **Fijo en la app:** layout, reglas de validación, lógica de ranking. Los multiplicadores de temporada **no** modifican el tope de canje.

### 2.8 B2B: red de eco-aliados 🟡

| Plan            | Fee                              | Visibilidad                                                                                                 | Límite de invasión                        |
| --------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Básico (piloto) | $0 los primeros 3 meses          | Aparece en el mapa cuando el usuario lo abre                                                                | Sin notificaciones                        |
| Destacado       | $30–50/mes                       | Primero en el mapa dentro de 500 m; sugerencia en el módulo EcoPoints ("Gana 3 pts por $1 aquí con Diners") | Máx. 1 sugerencia de comercio/día/usuario |
| Premium         | $80–120/mes + $200 de activación | Lo anterior + métricas agregadas y anónimas (visitas, transacciones)                                        | Sin datos personales                      |

Principio de **no invasión** (obligatorio en el código): las sugerencias de comercios solo se muestran con BLU ya abierto (nunca push externo); el usuario puede silenciarlas desde configuración; el mapa solo se activa cuando el usuario entra voluntariamente a EcoClub.
Aliados objetivo: mercados de barrio, tiendas a granel, talleres de bicicleta, cargadores eléctricos. **No** se integra con GIRA (programa de Corporación Favorita).

---

## 3. Modelo financiero (recalculado)

**Supuestos (todos editables):** comisión plana 2% ⚠️ · tope 40% · base de usuarios 50% banda A / 35% B / 15% C · CAC in-app $5 (solo año 1) 🟡 · operación de APIs $0,80/usuario/mes 🟡 · inversión MVP $8.500.

### 3.1 Margen por usuario

|                        | Ana ($200) | Diego ($400) | Valeria ($800) | Promedio ponderado |
| ---------------------- | ---------- | ------------ | -------------- | ------------------ |
| Comisión / año         | $48,00     | $96,00       | $192,00        | $86,40             |
| Recompensas máx. (40%) | $19,20     | $38,40       | $76,80         | $34,56             |
| CAC (año 1)            | $5,00      | $5,00        | $5,00          | $5,00              |
| Operación APIs / año   | $9,60      | $9,60        | $9,60          | $9,60              |
| **Margen año 1**       | **$14,20** | **$43,00**   | **$100,60**    | **$37,24**         |
| **Margen año 2+**      | **$19,20** | **$48,00**   | **$105,60**    | **$42,24**         |

Gasto mensual promedio ponderado: $360.

### 3.2 Sensibilidad a la comisión promedio real

| Comisión | Margen/usuario año 1 | 500 usuarios (año 1 / año 2) | 2.000 usuarios    | 10.000 usuarios     |
| -------- | -------------------- | ---------------------------- | ----------------- | ------------------- |
| 2%       | $37,24               | $18.620 / $21.120            | $74.480 / $84.480 | $372.400 / $422.400 |
| 1,5%     | $24,28               | $12.140 / $14.640            | $48.560 / $58.560 | $242.800 / $292.800 |
| 1%       | $11,32               | $5.660 / $8.160              | $22.640 / $32.640 | $113.200 / $163.200 |

### 3.3 Lecturas honestas del modelo

- Con comisión de 1%, el usuario de banda A queda en **equilibrio en el año 1** (−$0,20) y positivo desde el año 2: el tope del 40% protege las recompensas, pero **no** protege costos fijos por usuario (CAC y APIs).
- Con 1% y 500 usuarios, el margen del año 1 ($5.660) **no** cubre el MVP ($8.500); lo recupera acumulado alrededor del mes 16 ($13.820 al cierre del año 2). Con 1,5% y 500 usuarios sí lo cubre en el año 1.
- Si se usan los topes por nivel (45/50/55%), el margen sobre recompensas baja de 60% a 55/50/45%. Re-correr esta tabla si la mayoría de usuarios llega a Verde/Guardián.
- No incluye: fees B2B, ahorro por menor churn, marketing fuera de BLU, costo del equipo, comisión de ReciVeci por recolección (⚠️ a negociar).
- Patrocinios de temporada: **palanca opcional**, el modelo base no depende de ellos.

### 3.4 Inversión MVP — USD 8.500 (rango del concurso: 7.500–10.000)

| Componente                 | Detalle                                                | Costo  |
| -------------------------- | ------------------------------------------------------ | ------ |
| Arquitectura base          | React Native, Flask/Python, cloud                      | $4.500 |
| Algoritmos ambientales     | Motor CO₂ por MCC, factores IPCC calibrados a Quito    | $1.500 |
| Gamificación + back-office | EcoPoints, niveles, topes, panel de temporadas         | $1.500 |
| Integraciones              | Strava OAuth2, ReciVeci (ReciApp), MCC del core Diners | $1.000 |

Roadmap: 0–6 meses piloto en Quito (Metro, ReciVeci, eco-aliados) → 6–12 meses Guayaquil y Cuenca → 12–24 meses Perú.

---

## 4. Buyer personas (resumen)

|                                   | Ana Paredes, 26                                                  | Diego Morales, 32                                                | Valeria Torres, 38                                     |
| --------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Perfil                            | Asistente de marketing, primer empleo formal                     | Ingeniero de software, casado                                    | Gerente de producto, propietaria                       |
| Banda / peso                      | A · 50%                                                          | B · 35%                                                          | C · 15%                                                |
| Pagos fuera de Diners             | Metro y gym en efectivo, servicios por transferencia             | Servicios por transferencia, gym en efectivo, supermercado mixto | Predial por transferencia, Metro rara vez              |
| Reto principal                    | 🚇 Metro Diners                                                  | 🏃 Km Verdes                                                     | ♻️ ReciVeci + score MCC                                |
| Gancho en BLU (nivel Descubierto) | "Esta semana redujiste 1,2 kg de CO₂. Conviértelo en descuento." | "Corriste 28 km: podrías haber ganado 140 EcoPoints."            | "Generaste 4,8 kg de CO₂ este mes, sobre el promedio." |

---

## 5. Estado del código y backlog para el agente

**Estado verificado en el repo (`src/`):** Expo Router con tabs. Pantallas: `app/(tabs)/home.tsx`, `menu.tsx` y `wallet.tsx` (estos dos son stubs de ~19 líneas), `ecoclub/index.tsx` (MenuEco), `metro.tsx`, `reciveci.tsx`, `km-verdes.tsx`. Componentes: `EcoGauge`, `ValidationCard`, `ChallengeCard`, `EquivalenceCard`, `EcoHeader`, `BottomNav`. Strava OAuth2 funcional con `expo-secure-store`.

**Hallazgos concretos:**

| Archivo                       | Problema                                                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ecoclub/km-verdes.tsx:21-22` | `EXPO_PUBLIC_STRAVA_CLIENT_SECRET` queda **expuesto en el bundle de la app**. El intercambio de token debe hacerse en el backend (Flask) o en un proxy. Prioridad alta. |
| `ecoclub/km-verdes.tsx:180`   | `const metaKm = 35;` hardcodeado.                                                                                                                                       |
| `ecoclub/index.tsx:31, :37`   | `"3000 EcoPoints"` y `co2Value={5.2}` hardcodeados.                                                                                                                     |
| `home.tsx` (~líneas 120-142)  | Card de logros fijo en ReciVeci: `23/50 kg`, `130 EcoPoints`. Sin carrusel.                                                                                             |
| `ecoclub/metro.tsx:99`        | Imagen `via.placeholder.com`; se rompe sin internet.                                                                                                                    |
| —                             | No existe pantalla de Recompensas/Canje, ni MCC, ni niveles, ni capa de datos.                                                                                          |

**Arquitectura sugerida (para evitar más hardcode):**

```
src/config/ecoclub.config.ts      // todas las constantes de la sección 2
src/lib/mcc.ts                    // co2 y puntos por transacción (funciones puras)
src/lib/points.ts                 // acumulación, topes, caducidad FIFO, disponible-para-canjear
src/lib/levels.ts                 // nivel por días activos consecutivos
src/lib/seasons.ts                // validación/lectura de temporadas
src/data/mock/                    // transacciones, usuario, temporadas, eco-aliados (simulan back-office)
src/hooks/useEcoClub.ts           // estado derivado para las pantallas
```

```ts
// src/config/ecoclub.config.ts (valores iniciales)
export const ECOCLUB = {
  valorPuntoUSD: 0.005,
  minCanjePts: 200,
  caducidadDias: 90,
  tasaInterchange: { default: 0.02 }, // por MCC cuando haya datos reales
  topePctPorNivel: {
    activado: 0.4,
    constante: 0.45,
    verde: 0.5,
    guardian: 0.55,
  },
  diasParaNivel: { constante: 45, verde: 90, guardian: 180 },
  bandas: [
    { id: "A", gastoMax: 300, generacionMaxPts: 300, saldoMaxPts: 900 },
    { id: "B", gastoMax: 600, generacionMaxPts: 600, saldoMaxPts: 1800 },
    { id: "C", gastoMax: null, generacionMaxPts: 1200, saldoMaxPts: 3600 },
  ],
  retos: {
    reciveciPtsPorKg: 20,
    stravaPtsPorKm: 5,
    metroBonusPorRecarga: 50,
    metroMaxRecargasBonificadas: 10,
  },
  topOfWallet: { umbralUSD: 200, debitosRecurrentesMin: 2, multiplicador: 1.5 },
  cuotaManejoUSD: 8,
  millaPts: 300,
  bonoPredial: { maxUSD: 50, comisionHistoricaMinUSD: 100 },
} as const;
```

**Backlog priorizado:**

| P   | Tarea                                                                                                       | Criterio de aceptación                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0  | Mover el secreto de Strava fuera del cliente                                                                | Ningún `EXPO_PUBLIC_*` contiene secretos; el intercambio de token ocurre en un endpoint propio (puede ser mock documentado).                                        |
| P0  | Crear `ecoclub.config.ts` y quitar hardcodes (`metaKm`, EcoPoints, `co2Value`)                              | `grep` de `35`, `3000`, `5.2` no devuelve valores de negocio en componentes.                                                                                        |
| P0  | `lib/mcc.ts` + `lib/points.ts` con tests unitarios                                                          | Dado un set de transacciones mock, devuelve CO₂, puntos, tope mensual y "disponible para canjear" según 2.2–2.6; tests cubren topes, caducidad FIFO y saldo máximo. |
| P0  | Pantalla **Recompensas/Canje** (`ecoclub/recompensas.tsx`)                                                  | Muestra saldo, "disponible para canjear", catálogo de la tabla 2.4 (sin hoteles/aerolíneas), umbral de 200 pts y estado bloqueado por nivel con mensaje claro.      |
| P1  | MenuEco real: donut con CO₂ calculado, nivel, historial de puntos, opciones de canje, indicador `$150/$200` | Todo viene de `useEcoClub`, nada fijo.                                                                                                                              |
| P1  | Home: carrusel de logros con los 3 retos + línea "X pts = $Y para tu factura"                               | Los tres retos rotan con datos reales del hook.                                                                                                                     |
| P1  | Pantalla de pago BLU (mock) con "Aplicar EcoPoints"                                                         | Respeta tope, mínimo y orden FIFO; muestra total con descuento.                                                                                                     |
| P1  | Niveles: cálculo por días activos, degradación gradual, gancho "Descubierto"                                | `lib/levels.ts` testeado; vista de usuario no registrado muestra score y "podrías haber ganado X pts".                                                              |
| P2  | Temporadas desde JSON mock (banner, retos especiales, ranking grupal)                                       | Cambiar el JSON cambia la UI sin tocar código.                                                                                                                      |
| P2  | Mapa/lista de eco-aliados con planes y tope de 1 sugerencia/día                                             | Respeta silenciar y "solo con BLU abierto".                                                                                                                         |
| P2  | Metro: imagen local en `assets/`; textos en español en todas las pantallas                                  | Sin URLs externas para recursos de UI.                                                                                                                              |

Notas para el agente: textos de UI en español; mantener el diseño del Figma (verde `ecoColors.ts`, azul Diners); preferir funciones puras testeables sobre lógica dentro de componentes.

---

## 6. Decisiones abiertas (con valor por defecto para no bloquear el desarrollo)

| #   | Decisión                                                   | Default usado                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ¿Puntos base MCC y bonus de reto son aditivos?             | Sí (2.3). Un bonus de Metro de 50 pts sobre una recarga de $5 supera con mucho el valor de su comisión; el **tope de canje** protege el costo, pero el usuario verá puntos que no puede usar. Calibrar generación vs. tope con datos de Diners. |
| 2   | Valor del multiplicador Top of Wallet                      | 1,5× sobre puntos base.                                                                                                                                                                                                                         |
| 3   | Cuota de manejo real de Diners                             | $8 (supuesto).                                                                                                                                                                                                                                  |
| 4   | ¿Los topes por nivel suben (40→55%) o se mantienen en 40%? | Suben, como se definió; el margen baja (3.3).                                                                                                                                                                                                   |
| 5   | Criterio del bonus "bajo carbono"                          | ≤ 0,6 kg CO₂ por $10 de gasto del mes.                                                                                                                                                                                                          |
| 6   | Comisión por MCC (en especial 4111)                        | 2% plano hasta recibir datos reales.                                                                                                                                                                                                            |

---

## 7. Correcciones respecto a v3 y v4

1. **Promedios ponderados mal calculados.** v3 mostraba comisión promedio $81 y recompensas $32 (incorrecto; correcto $86,40 y $34,56). v4 mostraba margen ponderado $34,30 / $39,30 y gasto promedio ~$320 (correcto: $37,24 / $42,24 y $360).
2. **Tope mensual por persona en v4** ($0,60 / $1,20 / $2,40) equivalía al 15% de la comisión, no al 40%. Correcto: $1,60 / $3,20 / $6,40 (2.6).
3. **"Cuota de manejo inalcanzable para Ana"** no se debe al saldo máximo ni solo al tope: con el tope por nivel, Ana cubre 20–27% de la cuota y solo Valeria la cubre completa desde nivel Verde (2.6).
4. **Sensibilidad v4** usaba $34 de promedio y omitía CAC/APIs en el caso pesimista. v3 afirmaba que el caso pesimista ($13.000) cubría el MVP en el año 1; con CAC y operación incluidos, no lo cubre hasta el año 2 (3.3).
5. **Niveles de canje de v3** (Básico/Verde/Guardián por cantidad de puntos) quedan **reemplazados** por los niveles de comportamiento de v4 (2.1); el canje se desbloquea por nivel, no por puntos acumulados.
6. **"Detectar recarga de Metro en efectivo"** (v3, escenario B) no es posible: las recargas en efectivo no aparecen en los datos de Diners. Reemplazado por la regla de 2.5.
7. **Dato del Metro:** la fuente oficial (mayo 2026) da ~218.000 viajes diarios y distribuye pasajeros por 18–29 años (45%) y 30–39 años (20%). El "55% entre 24 y 40 años" **no está en la fuente**; usar "65% de los pasajeros tiene entre 18 y 39 años".
8. **Nomenclatura:** la integración de reciclaje es con **ReciVeci (ReciApp)**. GIRA es el programa de Corporación Favorita y no se integra; evitar "ReciVeci GIRA".
9. **Eco-aliado:** v3 decía "2× puntos" y v4 "3 pts por $1" para MCC 5999. Unificado en 3 pts por $1.
