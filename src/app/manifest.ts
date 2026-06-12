import type { MetadataRoute } from "next";

// PWA instalable (spec sección 6): la señal en subterráneos y urgencias es la que es.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beca Medicina de Urgencia UDP",
    short_name: "Beca UDP",
    description:
      "Rotaciones, turnos, calendario, material y avisos de la Beca de Medicina de Urgencia UDP.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f9",
    theme_color: "#00407a",
    lang: "es",
    icons: [
      { src: "/iconos/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/iconos/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
