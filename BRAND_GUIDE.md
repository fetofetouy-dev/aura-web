# 📘 Aura // Guía de Identidad Visual y Estilo Web (V1.0)

**Propósito del documento:** Esta guía define los parámetros visuales para el desarrollo del sitio web de "Aura", una empresa de automatización de procesos e IA. El objetivo es lograr una estética "Tech Premium", minimalista, limpia y sofisticada, utilizando un modo oscuro profundo.

## 01. La Esencia de la Marca

- **Concepto Central:** Automatización inteligente que genera progreso y fluidez.
- **Personalidad:** Sofisticada, precisa, tecnológica, eficiente, directa, "High-end Silicon Valley".
- **Vibe Visual:** Dark mode profundo, neón sutil, espacio negativo generoso, tipografía limpia. Menos es más.

## 02. El Logo

Se utilizará la variante "Arrow Flow wordmark".

**Descripción:** Logotipo tipográfico en mayúsculas sans-serif. La barra horizontal de la primera letra 'A' es reemplazada por una flecha estilizada con un gradiente de color, apuntando hacia la derecha (progreso).

**Uso Principal:** El logo debe usarse siempre en color blanco (para el texto) conservando el gradiente original en la flecha.

**Restricciones:**
- No usar sobre fondos claros (la marca es nativa de dark mode).
- No alterar los colores del gradiente de la flecha.
- No añadir sombras ni efectos 3D al texto.

## 03. Paleta de Colores (The Dark Mode Tech Stack)

Los colores están diseñados para un contraste alto pero cómodo a la vista. El fondo no es negro puro, sino un carbón profundo para mayor elegancia.

### Fondos y Superficies
- **Background Principal (Deep Charcoal):** `#0A0B10` (Usar para el body y secciones principales).
- **Superficie Secundaria (Elevated/Cards):** `#13151E` (Para tarjetas, barras laterales o elementos que necesitan destacarse sutilmente del fondo).
- **Bordes Sutiles:** `#1F2937` (Para líneas divisorias o bordes de tarjetas muy finos).

### Acentos (El "Aura" y la Flecha)
Este gradiente es el núcleo de la identidad. Se usa en el logo, botones principales y elementos gráficos sutiles.
- **Gradiente Start (Electric Blue):** `#3B82F6`
- **Gradiente End (Vivid Violet):** `#8B5CF6`
- **Regla CSS para gradiente:** `background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);`

### Tipografía y Contenido
- **Texto Titulares (Blanco Puro):** `#FFFFFF` (Para H1, H2, H3 y el texto del logo).
- **Texto Cuerpo (Gris Claro):** `#E5E7EB` (Para párrafos, subtítulos y lectura larga. Reduce la fatiga visual).
- **Texto Silenciado/Inactivo:** `#9CA3AF` (Para pies de foto, breadcrumbs o estados inactivos).

## 04. Tipografía

Buscamos una fuente sans-serif neo-grotesca, altamente legible, moderna y neutral.

**Familia Tipográfica Principal:** Inter (Disponible en Google Fonts). Es el estándar actual para interfaces tech limpias.

**Alternativa premium si se desea:** SF Pro Display (Apple system font) o Geist Sans (Vercel).

### Jerarquía y Tamaños (Referencia para Desktop)
- **H1 (Título Principal Hero):** Inter Bold (700) o Extra Bold (800). Tamaño aprox: 4rem (64px). Tight tracking (letter-spacing: -0.02em).
- **H2 (Títulos de Sección):** Inter Bold (700). Tamaño aprox: 2.5rem (40px).
- **H3 (Títulos de Tarjetas):** Inter SemiBold (600). Tamaño aprox: 1.5rem (24px).
- **Body/Párrafos:** Inter Regular (400). Tamaño base: 1rem o 1.125rem (16px o 18px). Line-height generoso (1.6).
- **Botones y Menús:** Inter Medium (500) o SemiBold (600).

## 05. Elementos de UI y Gráficos

### Botones (CTA Principal)
Deben sentirse modernos y digitales.
- **Forma:** "Pill shape" (bordes completamente redondeados). `border-radius: 9999px;`
- **Color:** Fondo con el gradiente de acento principal. Texto blanco.
- **Estado Hover:** Un ligero resplandor (box-shadow con el color del gradiente) o un sutil aclarado del gradiente.

### Iconografía
- **Estilo:** Minimalista, trazo fino (thin stroke), limpio.
- **Librerías recomendadas:** Heroicons (Outline), Lucide Icons o Phosphor Icons (Thin/Light weight).
- **Color de iconos:** Generalmente en blanco (#FFFFFF) o con el gradiente de acento aplicado al trazo si es un ícono destacado.

### Fondos y Elementos Gráficos (El toque "Tech")
Para evitar que el sitio se sienta plano, usaremos elementos de fondo muy sutiles inspirados en los conceptos anteriores.

- **Líneas de Flujo:** Líneas curvas muy finas (1px) que cruzan el fondo, simulando conexiones de red o nodos.
  - Color de líneas: Deben ser casi imperceptibles. Usar el gradiente principal pero con una opacidad muy baja (entre 5% y 10%).
- **Resplandores (Glows):** No usar orbes grandes y borrosos. Usar resplandores muy localizados y suaves detrás de elementos clave (como el logo en el hero o una imagen principal) para dar profundidad.

### Layout y Espaciado
- **Principio Clave:** Espacio negativo generoso. No amontonar elementos. Dejar que el contenido "respire".
- **Grid:** Utilizar una cuadrícula limpia para alinear textos y tarjetas.

---

**Nota:** El objetivo es construir una interfaz que se sienta rápida, ligera y premium. La clave está en la sutileza de los detalles: el grosor fino de los iconos, el espaciado amplio entre secciones y la aplicación muy controlada del gradiente de color solo en los puntos de mayor interés.
