import type { MalgaOptions } from 'src/interfaces'

// Cada instância coleta o próprio cartão, identificada pelo container do
// número. É o que impede dois cartões na mesma página de dividirem a coleta.
export function getStorageKey(options: MalgaOptions) {
  return `malga-card-${options.config.fields.cardNumber.container}`
}

/**
 * Os campos configurados nesta instância que ainda não têm valor coletado.
 * Considera só `config.fields` da instância: um campo que o merchant não
 * configurou não é cobrado.
 */
export function getMissingCardFields(options: MalgaOptions): string[] {
  const card = JSON.parse(
    sessionStorage.getItem(getStorageKey(options)) || '{}',
  )

  return Object.keys(options.config.fields).filter((field) => !card[field])
}
