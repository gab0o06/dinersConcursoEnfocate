# EcoClub × Diners Club (BLU) — Web & Pitch Edition

> Prototipo y demostración interactiva de **EcoClub** para el pitch de defensa final ante el jurado de Diners Club Ecuador. 
> Optimizado para visualización web responsive con **marco interactivo de presentación** en desktop y experiencia 100% nativa en navegadores móviles.

---

## 🚀 Inicio Rápido (Web)

### 1. Ejecutar servidor de desarrollo Web
```bash
pnpm start
# o también:
pnpm web
```
Abre automáticamente el navegador en `http://localhost:8081` (o presiona `w` en la consola).

### 2. Compartir en vivo durante el Pitch (Túnel con QR)
Si deseas que los jurados o profesores prueben la app desde sus propios teléfonos durante la defensa:
```bash
pnpm tunnel
```
Esto genera una URL pública segura (`https://*.exp.direct`) y un código QR en la consola que cualquier persona puede escanear en su celular sin instalar APK ni dependencias.

### 3. Compilación estática de producción (Export Web)
```bash
pnpm build:web
```
Genera los bundles y páginas pre-renderizadas en la carpeta `dist/`.

### 4. Servir la compilación localmente
```bash
pnpm serve
# o para compilar y servir en un solo comando:
pnpm preview
```
Disponible en `http://localhost:3000`.

---

## 🌐 Despliegue en la Nube (1 Clic)

El repositorio incluye configuraciones listas para producción:

* **Vercel** (`vercel.json`):
  ```bash
  npx vercel
  ```
* **Netlify** (`netlify.toml`):
  ```bash
  npx netlify deploy --prod
  ```

---

## 🎯 Herramientas Integradas para el Pitch de Defensa

Cuando accedes desde una computadora o laptop conectada a un proyector:
1. **Marco Móvil de Presentación:** Muestra el prototipo en un mockup de smartphone realista centrado, con sombra y proporción perfecta.
2. **Barra de Navegación Rápida:** Atajos en 1 clic a los momentos clave del pitch:
   - 🏠 **Home BLU:** Vista bancaria con anzuelo Capa 0 y productos.
   - 🌿 **EcoClub Dashboard:** Indicador de CO₂, nivel y desglose FIFO de puntos.
   - 🏬 **Eco-Aliados B2B:** Directorio de comercios, mapa y cupón QR.
   - 💳 **Pago BLU:** Demostración de canje en tiempo real con descuento variable.
   - 🎁 **Canjes / Recompensas:** Catálogo de productos sostenibles.
3. **Selector Capa 0 vs Registrado:** Alterna en vivo entre el usuario no registrado (anzuelo con puntos retroactivos calculados pasivamente) y el usuario activo para demostrar la captación.
4. **Modo Pantalla Completa:** Botón para expandir o contraer el marco móvil según la necesidad de la pantalla.

> En dispositivos móviles reales (pantallas < 768px), el marco se oculta automáticamente para ofrecer una experiencia fluida de pantalla completa.

---

## 🧪 Pruebas Unitarias

Ejecutar la suite de pruebas del motor financiero y reglas de negocio:
```bash
pnpm test
```
7 pruebas unitarias pasando al 100%.
