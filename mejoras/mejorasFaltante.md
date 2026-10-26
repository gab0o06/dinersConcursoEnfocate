# EcoClub — Brechas entre la especificación y el código actual

> **Actualizado el 25-Oct-2026.** Comparativa contra `EcoClub_PitchDoc_v3.md` (especificación v3 + v4).
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
| **Mocks de back-office** (`usuario.ts`, `temporadas.json`, `ecoAliados.json`) | ✅ | Creados en `src/data/mock/` |
| **Hook de presentación** (`useEcoClub.ts`) | ✅ | Creado en `src/hooks/useEcoClub.ts` |
| **Pantallas `menu.tsx` y `wallet.tsx`** | ✅ | Vistas completas funcionales con perfiles y tarjetas |
| **Metro Diners** | ✅ | Tarjeta nativa offline + tope de 10 recargas bonificadas |
| **Home y MenuEco** (datos dinámicos, navegación) | ✅ | Fechas automáticas, saludo dinámico, enlace directo a canjes |
| **Suite de pruebas unitarias** (`pnpm test`) | ✅ | 7 pruebas unitarias pasando al 100% |
| **Seguridad Strava** (`client_secret` en cliente) | ⏸️ | **Omitido por decisión de MVP** (uso de mes gratis de API) |
| **Directorio / Pantalla de Eco-Aliados B2B** | 🔴 | Datos en mock, pero falta pantalla interactiva con mapa/lista |
| **Capa 0 — Gancho "Descubierto" (score CO₂ sin login)** | 🔴 | Pendiente vista de onboarding pasivo |
| **Banner visual de Temporada activa en UI** | 🟡 | Motor y mock listos, falta integrarlo como banner visual en Home/Eco |
| **Home — Carrusel deslizable de retos** | 🟡 | Lista vertical actual; falta convertirla a carrusel horizontal |
| **Notificaciones Push y sugerencias inteligentes** | 🔴 | Pendiente integración de `expo-notifications` con reglas de horario |
| **Ranking Grupal de Temporadas** | 🔴 | Pendiente leaderboard grupal (equipos / empresas) |

---

## 1. ⏸️ Omitido por decisión de MVP: Seguridad Strava

### 1.1 `EXPO_PUBLIC_STRAVA_CLIENT_SECRET` en bundle
* **Archivo:** `src/app/(tabs)/ecoclub/km-verdes.tsx`
* **Motivo:** Decisión intencional de producto para el MVP, aprovechando el mes de prueba gratuito de la API de Strava sin incurrir en costos ni complejidad de backend proxy intermedio.
* **Pendiente futuro (Fase de Producción):** Reemplazar por proxy en Flask/Node para canjear el `code` por `access_token`.

---

## 2. 🔴 Lo que falta por implementar (Próximas Prioridades)

### 2.1 Pantalla / Directorio de Comercios Eco-Aliados B2B
* **Estado actual:** El archivo mock `src/data/mock/ecoAliados.json` ya cuenta con comercios categorizados por planes (*Premium*, *Destacado*, *Básico*) y coordenadas en Quito.
* **Qué falta:**
  - Crear pantalla `src/app/(tabs)/ecoclub/eco-aliados.tsx` accesible desde MenuEco o Menú BLU.
  - Lista interactiva con buscador por categoría (Movilidad, Supermercado, Alimentos, Hogar).
  - Filtro por cercanía y badges de plan B2B.
  - Opción de canjear descuento QR directamente en el comercio seleccionado.

### 2.2 Capa 0 — Vista "Descubierto" (Anzuelo de Adquisición sin Registro)
* **Objetivo de la spec:** 100% de los clientes Diners deben poder ver su huella ambiental calculada pasivamente a través de sus consumos MCC **antes** de registrarse en EcoClub.
* **Qué falta:**
  - Crear componente o modal accesible desde la pantalla principal de BLU (`home.tsx`) para usuarios no registrados en EcoClub.
  - Mostrar score CO₂ del mes anterior con mensaje por arquetipo (*"Esta semana ahorraste 1,2 kg de CO₂. Activa EcoClub para convertirlo en descuentos"*).
  - Botón CTA de activación en 1 clic.

### 2.3 Banner Visual de Temporada Activa en Home / MenuEco
* **Estado actual:** `src/lib/seasons.ts` valida temporadas y `temporadas.json` tiene activa la campaña *"Verano Verde 2026"* (multiplicador Metro 2× y eco-aliados 1.5×).
* **Qué falta:**
  - Mostrar el banner configurable (`banner.titulo`, `banner.descripcion`, `banner.color`) en la cabecera de `ecoclub/index.tsx` o `home.tsx`.
  - Indicador visual cuando un consumo aplica un multiplicador de temporada.

### 2.4 Notificaciones Push Inteligentes y No Invasivas
* **Regla de negocio (§2.5):** Disparo condicional programado:
  - Notificación de los **jueves** cuando el gasto mensual esté entre el 70% y el 100% del umbral Top-of-Wallet ($140 - $200): *"Te faltan $X esta semana para activar tu multiplicador ×1.5"*.
  - Sugerencia de autorecarga de Metro si el usuario tiene < 4 recargas Diners en 30 días.
  - Respeto estricto al principio de no invasión: máximo 1 notificación/semana y posibilidad de silenciar alertas promocionales en ajustes.

### 2.5 Ranking Grupal (Gamificación Social B2B)
* **Regla de negocio (§2.7):** Retos comunitarios por empresas, familias o universidades.
* **Qué falta:**
  - Pantalla o pestaña de Leaderboard dentro de la temporada activa.
  - Ranking de puntos acumulados por equipo para incentivar la competencia sostenible.

---

## 3. 🟡 Mejoras Visuales y de UX Pendientes

### 3.1 Carrusel Deslizable Horizontal en Home
* **Estado actual:** En `home.tsx`, la tarjeta de logros semanales muestra los 3 retos (ReciVeci, Strava, Metro) en filas verticales continuas.
* **Mejora:** Implementar un carrusel horizontal con animación swipe para destacar un reto a la vez con tarjetas de mayor impacto visual.

### 3.2 Modal de Historial de Puntos Detallado en MenuEco
* **Estado actual:** El saldo y los puntos se muestran de forma agregada; el detalle individual de consumos está en la Wallet.
* **Mejora:** Agregar en `ecoclub/index.tsx` un modal desplegable que muestre la lista de batches acumulados con su fecha exacta de vencimiento a 90 días.

---

## 4. Matriz de Prioridades Actualizada

| Prioridad | Tarea | Esfuerzo estimado | Impacto |
| :---: | :--- | :---: | :---: |
| **P1** | Pantalla de lista de Eco-Aliados B2B (`eco-aliados.tsx`) | Medio | Alto (demuestra monetización B2B) |
| **P1** | Banner de Temporada Activa en Home/MenuEco | Bajo | Medio (visibilidad de campañas) |
| **P1** | Capa 0: Modal "Descubierto" (adquisición pasiva) | Medio | Alto (narrativa del pitch) |
| **P2** | Carrusel horizontal interactivo en Home | Bajo | Estético / UX |
| **P2** | Sistema de notificaciones push condicionales | Medio | Retención |
| **P2** | Ranking Grupal de Temporada | Medio | Gamificación social |
