# Design

## Theme
Institucional UDP, registro producto. Editorial y sobrio: rojo institucional como
único acento, superficies blancas/neutras, serif solo en títulos de página y
secciones, esquinas rectas. Familiaridad por sobre sorpresa; el acento marca
acción y estado, nunca decora.

## Color
Tokens en `src/app/globals.css` (CSS variables + `@theme inline` de Tailwind 4).
Acento único; segundo nivel neutro para superficies; vocabulario de estado.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` | `#ffffff` | `#161616` | Fondo de página |
| `--surface` | `#ffffff` | `#1f1f1f` | Tarjetas, paneles, barras |
| `--foreground` | `#232323` | `#ece9e4` | Texto principal (≥4.5:1) |
| `--atenuado` | `#6b6f73` | `#a3a09b` | Texto secundario (verificado AA) |
| `--borde` | `#e3e3e0` | `#353535` | Bordes y divisores |
| `--udp` | `#c23633` | `#e0716d` | Acento: acción primaria, selección, foco |
| `--udp-suave` | `#f9efee` | `#2e2020` | Fondo de chip/selección |
| `--urgente` | `#a31815` | `#f1827d` | Estado urgente (avisos) |

Color fijo por servicio (calendario): cada servicio trae su propio hex para lectura
rápida; se usa al 12% como fondo de chip y full en el punto indicador.

## Typography
Una familia sans para todo el cuerpo, UI y datos (**Geist**); serif (**EB Garamond**,
equivalente libre del Garamond Premier Pro de udp.cl) reservada a `h1` y títulos de
sección — expresión de identidad institucional, no display gratuito. Escala rem fija
(no fluida): base 16px, ratio ~1.2. `text-wrap: balance` en títulos.

## Motion
Producto: 150–250 ms, ease-out, transform/opacity. La transición comunica estado
(hover, foco, press, entrada), nunca decora. Entrada escalonada solo en la pantalla
"Hoy" (superficie de aterrizaje). Alternativa para `prefers-reduced-motion` en todo.

## Components
`src/components/ui.tsx` y `Nav.tsx`. Cada interactivo: default, hover, focus-visible,
active. Tarjeta táctil con press feedback. Chip de estado/servicio. Estado vacío que
enseña (`Vacio`). Skeletons de ruta (`loading.tsx`) en vez de spinners.

## Layout
Mobile-first. Móvil: cabecera institucional + barra inferior de 5 pestañas. Desktop:
sidebar fija. Áreas táctiles ≥44px. Contenedor de lectura acotado; matriz de
rotaciones colapsa a acordeón en móvil (sin scroll horizontal).
