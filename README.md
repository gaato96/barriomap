# BarrioMap 🗺️

Plataforma web hiperlocal que combina un **mapa 3D interactivo (estilo Monopoly/SimCity)** con un
**directorio/marketplace** de comercios, showrooms y emprendedores de barrio en San Miguel de Tucumán.

> **Fase 1 (actual):** fundación visual completa y navegable con **datos mock**. La capa de datos
> está abstraída para conectar Supabase en la Fase 2 sin reescribir la UI.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **TailwindCSS** + primitivos estilo shadcn/ui
- **MapLibre GL JS** (mapa base claro CARTO Positron)
- **Three.js** — custom layer anclado a la matriz de cámara de MapLibre (casitas 3D fijadas a coordenadas)
- **Zustand** — estado global (filtros, selección, ubicación, UI)
- **react-hook-form + zod** — formulario de alta

## Cómo correr

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

> ⚠️ El mapa 3D necesita una pestaña **visible** para renderizar (los navegadores pausan el pintado
> en pestañas ocultas/en segundo plano, y MapLibre no dispara su evento `load`).

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Mapa 3D con casitas, buscador universal, filtros, hub de ofertas y drawer |
| `/directorio` | Lista/rejilla mobile-first con búsqueda en vivo, filtro por barrio, orden por cercanía |
| `/negocio/[slug]` | Perfil detallado del negocio (deep link) |
| `/sumar-negocio` | Formulario de alta con pin en el mapa (lead guardado en localStorage) |

## Arquitectura clave

- **`lib/data/index.ts`** — punto único de intercambio de backend. Hoy `MockRepository`; en Fase 2
  se reemplaza por `SupabaseRepository` respetando la interfaz `BusinessRepository`.
- **`components/map/ThreeHouseLayer.ts`** — el corazón del mapa 3D. Cada casita se ancla en su
  coordenada mercator exacta y comparte la matriz de proyección del mapa, por lo que **no flota**
  al rotar, inclinar o hacer zoom.
- **`components/map/houses/houseFactory.ts`** — genera las mallas por estilo (`HouseStyle`) con
  color de techo según categoría.
- **`lib/search/index.ts`** — buscador universal (nombre + descripción + keywords de catálogo),
  usado por el mapa y el directorio de forma consistente.

## Datos mock

- `lib/data/mock/businesses.ts` — ~16 negocios geolocalizados en San Miguel de Tucumán.
- `lib/data/mock/products.ts` — catálogo con keywords para la búsqueda.

## Próxima fase (Fase 2)

- Supabase (PostgreSQL + PostGIS) para búsquedas por proximidad reales y persistencia.
- Alta real de negocios y moderación; auth de comerciantes.
- Más estilos de casitas y assets pulidos; preview 3D del estilo en el alta.
