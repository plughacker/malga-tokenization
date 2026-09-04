/**
 * Tempo máximo de espera pela resposta de tokenização do iframe. Sem ele, uma
 * resposta que nunca chega deixa a promise pendurada indefinidamente.
 */
export const TOKENIZE_TIMEOUT_MS = 60_000
