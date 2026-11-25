# Helados Prince — sitio de pedidos online

Sitio de Helados Prince (Mitre 1354, San José, Entre Ríos). El cliente elige tamaño y sabores, y envía el pedido por WhatsApp para retirarlo en el local.
Tiene un solo local, así que no hay selector de localidad: queda elegido solo.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # verificación de tipos
npm run build      # build de producción
```

## Dónde se cambia cada dato

Todo lo propio de la heladería está en `src/config`:

| Qué | Archivo |
|---|---|
| Nombre, textos, colores, funciones activas | `brand.ts` |
| Dirección, teléfono, WhatsApp y horarios | `branches.ts` |
| Tamaños, precios y máximo de sabores | `products.ts` |
| Sabores y categorías (34 sabores, 4 categorías) | `flavors.ts` |
| Logo y fotos de Instagram | `brand-assets.ts` + `src/assets/brand` |

Paleta (en `brand.ts` → `theme` y `src/app/globals.css`): rosa `#ec4296`, turquesa `#23c3cc`, crema `#fff0d7`, amarillo `#ffdb39` (solo detalles) y negro `#191919`.
Tipografías: Bricolage Grotesque (títulos), Figtree (texto) y Shrikhand (palabras destacadas).

## Datos cargados (noviembre 2026)

- Dirección: Mitre 1354, San José, Entre Ríos. Teléfono y WhatsApp: +54 9 3442 504602.
- Instagram @helados.prince y Linktree linktr.ee/heladosprince.
- Precios: 1/4 kg $8.000 · 1/2 kg $14.000 · 1 kg $23.000.
- Horarios: lunes y miércoles a domingo; martes cerrado (ver `branches.ts`).
- Delivery y retiro en el local activados.

## Imágenes

- `src/assets/brand/logo.webp`: foto de perfil de su Instagram (400 × 400). Conviene reemplazarla por el logo original en alta resolución (idealmente SVG o PNG con transparencia).
- `src/assets/brand/ig-*.webp`: cuatro publicaciones de su Instagram, recortadas.
- `src/app/icon.png`, `apple-icon.png`, `opengraph-image.jpg`, `twitter-image.jpg`: favicon e imagen para compartir.
- Las bochas, los potes y el cono son ilustraciones genéricas (sin marcas). El cono de la portada se recortó con `design/source/recortar-fondo.cjs`; el original con fondo está en `design/source/`.
- `design/brand/`: capturas originales de las que salen los recortes de Instagram.
