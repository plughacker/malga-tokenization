import type { MalgaOptions } from 'src/interfaces'

// Cada instância coleta o próprio cartão, identificada pelo container do
// número. É o que impede dois cartões na mesma página de dividirem a coleta.
export function getStorageKey(options: MalgaOptions) {
  return `malga-card-${options.config.fields.cardNumber.container}`
}
