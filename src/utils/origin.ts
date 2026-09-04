import {
  HOSTED_FIELDS_VERSION,
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

/**
 * A origem do hosted-fields: esquema, host e porta, sem caminho.
 *
 * É com este valor que se compara `event.origin` de um `postMessage`, e
 * `event.origin` nunca inclui caminho. Acrescentar a versão aqui faria toda
 * mensagem legítima ser recusada.
 */
export function gettingOriginEvent(debug?: boolean, sandbox?: boolean) {
  if (debug) {
    return URL_HOSTED_FIELD_DEV
  }

  if (sandbox) {
    return URL_HOSTED_FIELD_SANDBOX
  }

  return URL_HOSTED_FIELD_PROD
}

/**
 * A URL de onde o iframe é carregado: a origem mais o caminho da versão.
 *
 * Serve para o `src` do iframe, e só para isso. Cada release do SDK carrega a
 * versão do hosted-fields contra a qual foi testado, e caminhos publicados são
 * imutáveis — por isso um deploy do iframe não alcança quem já está no ar.
 */
export function gettingHostedFieldsUrl(debug?: boolean, sandbox?: boolean) {
  return `${gettingOriginEvent(debug, sandbox)}/${HOSTED_FIELDS_VERSION}`
}
