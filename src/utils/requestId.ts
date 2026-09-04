/**
 * Identificador de uma chamada de tokenização. Vai na submissão e é conferido
 * na volta, para que cada chamada consuma apenas a sua própria resposta.
 */
export function generateRequestId(): string {
  const randomUUID = globalThis.crypto?.randomUUID

  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto)
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
