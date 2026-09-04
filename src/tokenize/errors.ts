import { TOKENIZE_TIMEOUT_MS } from 'src/constants'

export class TokenizeTimeoutError extends Error {
  public readonly timeout: number

  constructor(timeout: number = TOKENIZE_TIMEOUT_MS) {
    super(`Tokenize timed out after ${timeout}ms without a response`)

    this.name = 'TokenizeTimeoutError'
    this.timeout = timeout

    // Mantém `instanceof` funcionando quando o bundle é transpilado para ES5.
    Object.setPrototypeOf(this, TokenizeTimeoutError.prototype)
  }
}
