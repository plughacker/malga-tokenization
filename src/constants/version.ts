// Versão do hosted-fields contra a qual este SDK foi testado. A raiz de cada
// ambiente fica congelada no protocolo antigo (ADR 0001 do malga-hosted-fields),
// então o iframe é carregado de /<versão>/index.html. Só esse formato serve a
// versão: /<versão>/, com ou sem barra, cai no fallback da raiz do CloudFront.
export const HOSTED_FIELDS_VERSION = '2.0.0'
