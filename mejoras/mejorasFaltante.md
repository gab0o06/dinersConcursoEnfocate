# EcoClub — Brechas entre la especificación y el código actual

> **Actualizado el 28-Oct-2026.** Comparativa contra `EcoClub_PitchDoc_v3.md` (especificación v3 + v4).
> Marcas: 🔴 Falta por completo · 🟡 Parcial / mejora visual · ✅ Implementado · ⏸️ Omitido conscientemente (MVP)

---

## 0. Resumen Ejecutivo de Estado

| Área | Estado | Detalle |
| :--- | :---: | :--- |
| **Arquitectura de configuración** (`ecoclub.config.ts`) | ✅ | Centralizado en `src/config/ecoclub.config.ts` |
| **Capa de lógica pura** (`lib/levels.ts`, `lib/seasons.ts`) | ✅ | Lógica de negocio aislada y testeada |
| **Pantalla Recompensas / Canje** | ✅ | Implementada en `ecoclub/recompensas.tsx` con catálogo completo |
| **Pantalla de pago BLU con "Aplicar EcoPoints"** | ✅ | Implementada en `ecoclub/pago-blu.tsx` con toggle y cálculo real |
| **Sistema de niveles** (días activos + degradación gradual) | ✅ | Implementado en `src/lib/levels.ts` y store |
| **Motor financiero v4** (topes 40-55%, ToW ×1.5, bandas, FIFO) | ✅ | Implementado en `ecoPointsEngine.ts` y `mccScoring.ts` |
| **Mocks de back-office** (`usuario.ts`, `temporadas.json`, `ecoAliados.json`) | ✅ | Creados en `src/data/mock/` con datos enriquecidos |
| **Hook de presentación** (`useEcoClub.ts`) | ✅ | Creado en `src/hooks/useEcoClub.ts` con soporte para membresía |
| **Pantallas `menu.tsx` y `wallet.tsx`** | ✅ | Vistas completas funcionales con perfiles y tarjetas |
| **Metro Diners** | ✅ | Tarjeta nativa offline + tope de 10 recargas bonificadas |
| **Home y MenuEco** (datos dinámicos, navegación) | ✅ | Fechas automáticas, saludo dinámico, enlace directo a canjes |
| **Suite de pruebas unitarias** (`pnpm test`) | ✅ | 7 pruebas unitarias pasando al 100% |
| **Seguridad Strava** (`client_secret` en cliente) | ⏸️ | **Omitido por decisión de MVP** (uso de mes gratis de API) |
| **Directorio / Pantalla de Eco-Aliados B2B** (`eco-aliados.tsx`) | ✅ | **Implementado**: buscador, filtros por categoría, planes B2B (Premium, Destacado, Básico), distancias y modal QR de canje |
| **Banner visual de Temporada activa en UI** (`SeasonBanner.tsx`) | ✅ | **Implementado**: banner dinámico de Verano Verde 2026 en Home y EcoClub con multiplicadores y modal informativo |
| **Capa 0 — Gancho "Descubierto" (score CO₂ sin login)** | ✅ | **Implementado**: `Capa0DescubiertoCard` con score pasivo, puntos retroactivos calculados y CTA de activación en 1 clic |
| **Home — Carrusel deslizable de retos** (`ChallengesCarousel.tsx`) | ✅ | **Implementado**: carrusel horizontal con animación swipe, snap, tarjetas de alto impacto visual y paginación |
| **Modal de Historial de Puntos Detallado** (`PointsHistoryModal.tsx`) | ✅ | **Implementado**: modal con desglose de lotes (batches), origen, cálculo de días restantes a 90 días y regla FIFO |
| **Notificaciones Push y sugerencias inteligentes** | 🔴 | Pendiente integración de `expo-notifications` con reglas de horario |
| **Ranking Grupal de Temporadas** | 🔴 | Pendiente leaderboard grupal (equipos / empresas) |

---

## 1. ⏸️ Omitido por decisión de MVP: Seguridad Strava

### 1.1 `EXPO_PUBLIC_STRAVA_CLIENT_SECRET` en bundle
* **Archivo:** `src/app/(tabs)/ecoclub/km-verdes.tsx`
* **Motivo:** Decisión intencional de producto para el MVP, aprovechando el mes de prueba gratuito de la API de Strava sin incurrir en costos ni complejidad de backend proxy intermedio.
* **Pendiente futuro (Fase de Producción):** Reemplazar por proxy en Flask/Node para canjear el `code` por `access_token`.

---

## 2. ✅ Elementos Recientemente Implementados (28-Oct-2026)

### 2.1 Pantalla / Directorio de Comercios Eco-Aliados B2B
* **Archivo:** `src/app/(tabs)/ecoclub/eco-aliados.tsx`
* **Implementación:**
  - Pantalla dedicada integrada en `ecoclub/_layout.tsx` y accesible desde `ecoclub/index.tsx` y `menu.tsx`.
  - Buscador reactivo por texto (nombre, calle, descripción).
  - Selector de categorías (*Supermercado Eco*, *Movilidad*, *Alimentos*, *Hogar*, *Energía*).
  - Filtro por planes B2B (*Premium*, *Destacado*, *Básico*) con ordenación por nivel de alianza comercial.
  - Cálculo de distancia en km/m desde la ubicación en Quito.
  - Modal interactivo con código QR simulado, cupón `DINERS-ECO-XXXX`, botón para copiar y condiciones para presentación en caja para acumular 3× EcoPoints.

### 2.2 Banner Visual de Temporada Activa
* **Archivo:** `src/components/SeasonBanner.tsx`
* **Implementación:**
  - Componente que evalúa en runtime la temporada vigente usando `src/lib/seasons.ts` y `src/data/mock/temporadas.json` (*"Verano Verde 2026"*).
  - Muestra título, descripción y badges de multiplicadores activos (Metro 2×, Eco-Aliados 1.5×, Reto especial "Pedalea la ciudad").
  - Modal detallado con fechas de inicio y fin, multiplicadores MCC específicos (4111, 5999) y aviso de ranking grupal.
  - Integrado de forma destacada en la cabecera de `ecoclub/index.tsx` y en `home.tsx`.

### 2.3 Capa 0 — Vista "Descubierto" (Anzuelo de Adquisición sin Registro)
* **Archivo:** `src/components/Capa0DescubiertoCard.tsx`
* **Implementación:**
  - Soporte en `useEcoStore.ts` y `useEcoClub.ts` para el estado `isRegistered` y transición de nivel `'descubierto'` a `'activado'`.
  - Cálculo pasivo del CO₂ evitado del mes y los EcoPoints retroactivos acumulados a partir de los consumos con tarjeta Diners.
  - Mensaje contextual por arquetipo explicando el valor acumulado en cashback.
  - Botón CTA de activación en 1 clic (*"Activar EcoClub sin costo"*) con modal de bienvenida y feedback inmediato.
  - Switch interactivo para evaluación y pruebas (permite alternar entre "Vista Capa 0 Descubierto" y "Vista Registrado" en Home y EcoClub).

### 2.4 Carrusel Deslizable Horizontal en Home
* **Archivo:** `src/components/ChallengesCarousel.tsx`
* **Implementación:**
  - Carrusel horizontal con swipe suave (`snapToInterval`), indicador de página y tarjetas visuales para Metro Diners, Strava Km Verdes y ReciVeci.
  - Muestra progreso en tiempo real contra las metas semanales y botones de acceso directo a cada reto.

### 2.5 Modal de Historial y Caducidad FIFO a 90 Días
* **Archivo:** `src/components/PointsHistoryModal.tsx`
* **Implementación:**
  - Modal desplegable accesible al tocar el saldo de EcoPoints en `ecoclub/index.tsx`.
  - Lista completa de lotes (batches) generados por MCC, Strava, ReciVeci o Bonus, con fecha de adquisición y días restantes para su vencimiento según la regla FIFO.

---

## 3. 🔴 Lo que queda pendiente por implementar

### 3.1 Notificaciones Push Inteligentes y No Invasivas
* **Regla de negocio (§2.5):** Disparo condicional programado:
  - Notificación de los **jueves** cuando el gasto mensual esté entre el 70% y el 100% del umbral Top-of-Wallet ($140 - $200): *"Te faltan $X esta semana para activar tu multiplicador ×1.5"*.
  - Sugerencia de autorecarga de Metro si el usuario tiene < 4 recargas Diners en 30 días.
  - Respeto estricto al principio de no invasión: máximo 1 notificación/semana y posibilidad de silenciar alertas promocionales en ajustes.

### 3.2 Ranking Grupal (Gamificación Social B2B)
* **Regla de negocio (§2.7):** Retos comunitarios por empresas, familias o universidades.
* **Qué falta:**
  - Pantalla o pestaña de Leaderboard dentro de la temporada activa.
  - Ranking de puntos acumulados por equipo para incentivar la competencia sostenible.

---

## 4. Matriz de Prioridades Actualizada

| Prioridad | Tarea | Esfuerzo estimado | Impacto |
| :---: | :--- | :---: | :---: |
| **P2** | Sistema de notificaciones push condicionales | Medio | Retención |
| **P2** | Ranking Grupal de Temporada | Medio | Gamificación social |
