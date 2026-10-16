# I **EcoClub Diners** _Documento Ejecutivo — Pitch Fase 3 · Versión 3_ 

Concurso Enfócate con Diners Club 5.0 · Categoría: Gamificación 

_Este documento incorpora el modelo financiero revisado: el tope de canje se calcula sobre la comisión real generada por cada usuario (no es un valor fijo), las tasas de comisión por MCC son hipótesis a calibrar con Diners, y los márgenes se presentan como rango de sensibilidad en lugar de una cifra única._ 

## **01 RESUMEN DEL PROYECTO** 

EcoClub es un módulo de gamificación integrado en **BLU de Diners Club** . Recompensa acciones sostenibles cotidianas — usar el Metro, reciclar, hacer deporte — con **EcoPoints canjeables por descuentos reales sobre la factura Diners** . El costo del programa escala con el gasto del usuario: quien genera más comisiones puede canjear más; quien genera menos, canjea menos. Por construcción, el margen es positivo en todos los segmentos. 

|I**Fricción Cero**<br>Score COIdesde MCC transaccional.|I**Costo Variable**<br>Tope de canje = 40% de la comisión real|I**Canal B2B**|
|---|---|---|
|Sin configurar nada. 100% de usuarios|del usuario. Nunca paga más de lo que|Red de eco-aliados que pagan fee de|
|activos.|ganó.|visibilidad. Ingreso B2B adicional.|



## **02 ¿QUÉ ES EL MCC SCORING? — EXPLICADO SIMPLE** 

_Merchant Category Code: el código de 4 dígitos que identifica el tipo de comercio en cada transacción._ 

I _ANALOGÍA RÁPIDA: Cada comercio tiene un código de 4 dígitos — igual que los prefijos telefónicos. Una gasolinera tiene el 5541, el Metro el 4111, un restaurante el 5812. Diners ya conoce ese código en cada transacción. EcoClub lo traduce a CO_ I _y a EcoPoints automáticamente, sin que el usuario configure nada._ 

#### **Tabla MCC — hipótesis a calibrar con Diners:** 

|**MCC**|**Tipo de comercio**|**Comisión real**|**Puntos por $1**|**Impacto en EcoPoints**|
|---|---|---|---|---|
|**5541**|Gasolineras|por calibrarII|0.5 pts / $1|ISin bonus verde|
|**5812 /**<br>**5411**|Restaurantes, supermercados|por calibrarII|1 pt / $1|IBonus pequeño o moderado|
|**4111 /**<br>**7941**|Metro, transporte público,<br>gimnasio|por calibrarII|2 pts / $1|IBonus verde alto|
|**5999**|Comercios eco-aliados|por calibrarII|3 pts / $1|IFee del comercio complementa|



II **NOTA PARA EL PITCH: "Las tasas de comisión por MCC son hipótesis a calibrar con los datos reales de Diners. El tope del 40% se calcula sobre la comisión efectiva, por lo que el modelo no genera pérdida por usuario aunque la tasa real de algún MCC sea menor que el supuesto."** 

**_Aclaración de capas:_** _el MCC scoring mide la huella de forma_ **_pasiva y automática_** _. Los retos de Strava y ReciVeci son una_ **_capa activa y voluntaria_** _que genera EcoPoints adicionales — sujetos al mismo tope del 40%. No se contradicen: se complementan._ 

## **03 SISTEMA DE ECOPOINTS — ACUMULACIÓN Y CANJE** 

#### **¿Cómo se acumulan?** 

|**Acción**|**EcoPoints**|**Verificación**|
|---|---|---|
|1 kg reciclado — ReciVeci|20 pts|ReciVeci confirma la recolección a domicilio|
|1 km en Strava verificado|5 pts|API Strava — GPS, actividades de carrera, bici o caminata|
|1 recarga Metro con Diners|50 pts (MCC 4111)|Detección automática — sin API del Metro|
|Compra en eco-aliado con Diners|2× pts de la compra|MCC 5999 — automático + fee del comercio|
|Score MCC bajo carbono ese mes|Bonus 100 pts|Calculado al cierre del mes según mix de MCCs|



**¿Para qué sirven? — Tres niveles de canje:** 

|**Nivel**|**Puntos**|**Equivalencia**|**Control de margen**|
|---|---|---|---|
|I**Básico**|200 pts mínimo|100 pts = $0.50 de descuento sobre saldo a pagar.<br>Visible en pantalla de pago de BLU como<br>"eco-cashback".|Máximo 40% de la comisión mensual<br>generada|
|I**Verde**|2.000 pts|2.000 pts = cuota de manejo mensual completa<br>cubierta.|Solo disponible si la comisión acumulada<br>lo respalda|
|I**Guardián**|300 pts / milla|300 pts = 1 milla del programa Diners existente.|Conecta con el programa premium ya<br>operativo|



## **04 CONTROLES FINANCIEROS — MODELO DE COSTO VARIABLE** 

_Cada control protege el margen. El más importante: el tope deja de ser fijo y pasa a ser variable._ 

I _REGLA CENTRAL: el tope de canje mensual máximo = 40% de la comisión real que ese usuario generó ese mes. Quien gasta poco puede canjear poco. Quien gasta mucho puede canjear más. Por construcción, el programa nunca paga más del 40% de lo que ganó — el 60% restante es margen antes de costos fijos._ 

|**Control**<br>**Valor**<br>**Por qué existe**|
|---|



|**Tope de canje mensual**|40% de la comisión generada<br>ese mes (no fijo)|Si el usuario generó $4 en comisiones, puede canjear máximo<br>$1.60. Antes era $10 fijo — independiente del gasto. Ahora escala<br>con el usuario.|
|---|---|---|
|**Caducidad de EcoPoints**|90 días|Los puntos acumulados son un pasivo contable. La caducidad lo<br>liquida y genera urgencia de uso — el usuario vuelve antes de<br>perderlos.|
|**Umbral mínimo de canje**|200 pts (= $1.00)|Procesar un canje de $0.05 cuesta más en infraestructura que el<br>beneficio entregado. El umbral elimina micro-canjes deficitarios.|
|**Umbral Top of Wallet**|$200 / mes en transacciones|Solo se liberan los multiplicadores cuando el usuario genera<br>suficientes comisiones. Por debajo del umbral el programa sigue<br>activo pero sin subsidios de alto costo.|
|**Bono predial**|Condicionado a gasto<br>acumulado|El bono de hasta $50 solo se libera cuando el usuario haya<br>generado el doble ($100) en comisiones históricas. Payback<br>garantizado antes de entregarlo.|
|**Saldo Metro fijo**|ELIMINADO|La recarga del Metro ya genera 50 EcoPoints por MCC 4111. Un<br>saldo adicional era doble recompensa por la misma acción. Se<br>elimina para no inflar el costo.|



## **05 CANAL DE ADQUIRENCIA B2B — EL MODELO DE NEGOCIO REAL** 

EcoClub no es un costo de marketing — es una fuente de ingresos. La red de eco-aliados genera ingresos B2B adicionales a las comisiones interbancarias. 

|**Fuente de ingreso**|**Mecanismo**|**Quién paga / nota**|
|---|---|---|
|**Comisión interbancaria**|Cada transacción capturada (Metro, eco-aliados, gym)|Variable según MCC — fuente<br>primaria|
|**Fee de visibilidad**|Comercio eco-aliado paga por aparecer en el mapa de<br>BLU|Comercio aliado — ingreso B2B<br>directo|
|**Fee de activación**|Nuevo comercio que ingresa al portafolio Diners via<br>EcoClub|Comercio nuevo — ingreso por<br>expansión|
|**Patrocinios de temporada**|Marcas que financian premios de temporadas<br>trimestrales|Palanca opcional — no está en el<br>modelo baseII|
|**Reducción de churn**|Usuario activo en BLU diariamente = menor cancelación|Ahorro en costo de adquisición<br>(~$150–300/cliente nuevo)|
|**Datos de comportamiento**|Hábitos de movilidad y consumo→cross-selling de<br>productos|Valor estratégico — productos<br>financieros personalizados|



II _Los patrocinios son una palanca de crecimiento opcional. Permiten subir el tope de canje, lanzar premios de temporada o subsidiar usuarios de bajo gasto — pero el modelo base no los requiere. "Aún no hay patrocinadores comprometidos" es una respuesta honesta porque el modelo no depende de ellos._ 

_Los comercios eco-aliados son mercados de barrio, tiendas a granel, talleres de bicicleta y cargadores eléctricos — no compiten con GIRA de Corporación Favorita, que opera con puntos canjeables exclusivamente en sus propios locales._ 

## **06 RENTABILIDAD — MODELO DE COSTO VARIABLE Y SENSIBILIDAD** 

_Los márgenes anteriores asumían que todos los usuarios gastaban $800/mes. Este modelo mezcla segmentos y es positivo en todos ellos._ 



<!-- Start of picture text -->
Comisión generada / usuario /<br>Recompensas (tope 40%) Margen sobre recompensas<br>año − =<br>100% de la comisión máx. 40% mín. 60%<br>variable según gasto del usuario nunca supera lo que generó antes de costos fijos (tech, equipo)<br><!-- End of picture text -->

#### **Margen por segmento de usuario (supuesto: comisión = 2%)** 

|**Gasto mensual con**<br>**Diners**|**Comisión / año**|**Recompensas máx.**|**Margen / año**|**Peso en la base**|
|---|---|---|---|---|
|**$200 / mes**|$48|$19|**$29**|50% de la base|
|**$400 / mes**|$96|$38|**$58**|35% de la base|
|**$800 / mes**|$192|$77|**$115**|15% de la base|
|**Promedio ponderado**|$81|$32|**$52 / usuario**|Supuesto base|



_"Ningún segmento da pérdida. El usuario de $200/mes sigue siendo rentable porque su tope de canje ($19) nunca supera los $29 de margen. Antes, con $10 fijo de costo y solo $48 de comisión, el modelo dependía de que todos llegaran a $800."_ 

**Análisis de sensibilidad — rango de comisión promedio real:** 

|**Comisión promedio real**|**Margen / usuario /**<br>**año**|**500 usuarios**|**2.000 usuarios**|**10.000 usuarios**|
|---|---|---|---|---|
|**2% (supuesto base)**|**~$52 / usuario**|**$26.000**|**$104.000**|**$518.000**|
|**1.5%**|~$39 / usuario|$19.000|$78.000|$389.000|
|**1% (escenario pesimista)**|~$26 / usuario|$13.000|$52.000|$259.000|



I _Incluso en el escenario pesimista (1% de comisión, 500 usuarios), el margen de $13.000 cubre la inversión del MVP de $8.500 dentro del primer año, antes de contar ingresos B2B de eco-aliados ni reducción de churn._ 

_Presentar este rango le da más credibilidad al modelo que una sola cifra. Si el jurado pregunta "¿y si la comisión es menor?", la respuesta es la tabla._ 

## **07 ESCENARIOS DE USO** 

### **ESCENARIO A — El Usuario Rentable (Top of Wallet)** 

Gasta más de **$200/mes** con Diners (Metro, gym, eco-aliados). Desbloquea multiplicadores. Las comisiones que genera (~$4/mes) cubren sus recompensas (~$1.60/mes máx.). **Margen neto: ~$29–115/año según segmento.** 

### **ESCENARIO B — El Usuario Bajo el Umbral (pipeline de activación)** 

Gasta menos de $200/mes. El tope del 40% lo protege automáticamente — sin multiplicadores costosos. BLU activa tres mecanismos para subirlo al umbral: 

N **Indicador en MenuEco:** "$150/$200 para activar tu multiplicador" — ancla psicológica visible en cada apertura de BLU. 

- N **Push del jueves:** "Te faltan $30 esta semana. Paga tu próximo gasto con Diners y activa tu multiplicador." 

- N **Sugerencia contextual:** detecta recarga de Metro en efectivo (MCC ausente) y sugiere autorecarga con Diners para no perder EcoPoints. 

_El escenario B no es pérdida — es pipeline. Cada usuario bajo el umbral tiene un camino automatizado para convertirse en usuario rentable, y mientras tanto el tope variable garantiza que no genera pérdida._ 

### **ESCENARIO C — El Usuario de Retos Activos (Strava y ReciVeci)** 

Conecta Strava y agenda recolecciones con ReciVeci voluntariamente. Sus puntos adicionales están sujetos al mismo tope del 40% — no requieren financiamiento externo ni patrocinadores. Son el 5% más comprometido de la base y el mayor generador de interacciones diarias con BLU. 

- N **Strava:** 5 pts/km verificado por GPS. Ranking grupal visible dentro de BLU (no en Strava) — obliga a abrir BLU incluso en días sin actividad. 

- N **ReciVeci:** 20 pts/kg. Recolección a domicilio agendada desde BLU. No depende de puntos físicos de Favorita/GIRA — sin conflicto. 

- N **Temporadas trimestrales:** equipos (empresa, familia, barrio, universidad) compiten colectivamente. Premia al grupo, no al individuo. Sostiene el engagement después de la semana 3. 

### **ESCENARIO D — Expansión Geográfica** 

|**Fase**|**Mercado**|**Aliados clave**|
|---|---|---|
|**0–6 meses — MVP**|Quito|Metro (218.000 viajes/día) · ReciVeci · eco-aliados Quito Norte y Sur|
|**6–12 meses —**<br>**Expansión**|Guayaquil y Cuenca|Metrovía + aliados reciclaje · Tranvía de Cuenca|
|**12–24 meses — Regional**|Perú|Metro de Lima · ReciVeci Perú (ya opera en el país)|



## **08 INVERSIÓN REQUERIDA Y VIABILIDAD** 

_Cifra unificada: USD 8.500. Dentro del rango del concurso (USD 7.500–10.000)._ 

|**Componente**<br>**Detalle**<br>**Costo**|
|---|



|Arquitectura base|React Native (BLU) · Flask/Python (backend) · Infraestructura cloud<br>escalable|**$4.500**|
|---|---|---|
|Algoritmos ambientales|Motor COIpor MCC · Tabla de factores IPCC calibrados a Quito ·<br>Metodología WRAP|**$1.500**|
|Economía de gamificación|Sistema EcoPoints · niveles · tope variable · panel de campañas ·<br>ranking grupal|**$1.500**|
|Integraciones API|Strava OAuth2 · ReciVeci GIRA · MCC core Diners (ya implementado en<br>código)|**$1.000**|
|**TOTAL MVP**|Cubre arquitectura, algoritmos, gamificación e integraciones. Listo para<br>nuevos aliados con costo marginal mínimo.|**$8.500**|



I _La integración con Strava via OAuth2 ya está implementada en código (React Native + Expo Auth Session). El MCC scoring y el motor de EcoPoints son los componentes pendientes del MVP._ 

EcoClub Diners · Concurso Enfócate con Diners Club 5.0 · UDLA 2026 · Sheldon López · Rebeca Caicedo · Lukas Bustamante · Versión 3 

