import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import RegistrarSW from "@/components/RegistrarSW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Beca Medicina de Urgencia UDP",
    template: "%s · Beca Urgencia UDP",
  },
  description:
    "Portal de la Beca de Medicina de Urgencia UDP: rotaciones, turnos, calendario, material y avisos.",
  applicationName: "Beca Urgencia UDP",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Beca UDP" },
  robots: { index: false, follow: false }, // todo el contenido es privado
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00407a" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1520" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Nav />
        <div className="md:pl-56">
          <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-24 pt-4 md:py-8">
            {children}
          </main>
        </div>
        <RegistrarSW />
      </body>
    </html>
  );
}
