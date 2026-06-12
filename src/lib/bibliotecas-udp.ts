// Bases de datos de Salud disponibles vía Sistema de Bibliotecas UDP.
// Fuente: https://bibliotecas.udp.cl/recursos-online/colecciones-electronicas/
// (sección Salud, revisada en junio 2026). Fuera de la red UDP se entra con
// el acceso remoto institucional.

export const ACCESO_REMOTO_UDP = "https://bibliotecas.udp.cl/recursos-online/nuevo_acceso/";

export interface BaseDatosUDP {
  nombre: string;
  descripcion: string;
  url: string;
}

export const basesDatosSalud: BaseDatosUDP[] = [
  {
    nombre: "UpToDate",
    descripcion: "Revisiones clínicas al día; la referencia rápida en urgencia.",
    url: "https://sibudp.idm.oclc.org/login?url=https://www.uptodate.com/contents/search",
  },
  {
    nombre: "ClinicalKey",
    descripcion: "Libros y revistas Elsevier en español (incluye Rosen y Doyma).",
    url: "https://www.clinicalkey.es/",
  },
  {
    nombre: "ClinicalKey Student",
    descripcion: "Versión para estudio, con resúmenes y autoevaluaciones.",
    url: "https://www.clinicalkey.com/student",
  },
  {
    nombre: "DynaMed Plus",
    descripcion: "Síntesis de evidencia punto de atención (EBSCO).",
    url: "https://search.ebscohost.com/login.aspx?authtype=ip,url,uid&profile=dmp",
  },
  {
    nombre: "Access Medicina (McGraw-Hill)",
    descripcion: "Harrison, Tintinalli y más textos en español.",
    url: "https://accessmedicina.mhmedical.com/",
  },
  {
    nombre: "Ovid MEDLINE / PubMed",
    descripcion: "Búsqueda bibliográfica completa, 1946 al presente.",
    url: "https://ovidsp.ovid.com/ovid-new-a/ovidweb.cgi?T=JS&NEWS=n&CSC=Y&PAGE=main&D=medall",
  },
];
