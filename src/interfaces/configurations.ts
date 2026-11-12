export interface MalgaInputFieldConfiguration {
  container: string
  placeholder?: string
  type?: string
  needMask?: boolean
  defaultValidation?: boolean
}

export interface MalgaInputFieldConfigurations {
  fields: {
    cardNumber: MalgaInputFieldConfiguration
    cardHolderName: MalgaInputFieldConfiguration
    cardCvv: MalgaInputFieldConfiguration
    cardExpirationDate: MalgaInputFieldConfiguration
  }
  styles?: any
  preventAutofill?: boolean
}

export interface MalgaOptions {
  config: MalgaInputFieldConfigurations
  sandbox?: boolean
  debug?: boolean
}
/**
 * Returns the API key used by `tokenize()`. Called on every `tokenize()`,
 * right before the card data is sent, so it can fetch a fresh short-lived
 * sub-key from your backend.
 */
export type MalgaApiKeyProvider = () => string | Promise<string>

export interface MalgaConfigurations {
  /**
   * Use a sub-key created by your backend, never your secret key.
   * - Create it with POST /v1/auth using only the ["tokens"] scope.
   * - Use a short expiration (e.g. expires: 900) and one sub-key per checkout session.
   * - Don't use expires: 0 and don't hardcode the key in your HTML or front-end bundle.
   *
   * Accepts a string, or a function that returns it (sync or async). With a function,
   * the key is fetched on each `tokenize()` instead of once in the constructor.
   * Reference: https://docs.malga.io/api-reference/client-token/criar-nova-chave-publica-para-uso-no-client-side
   */
  apiKey: string | MalgaApiKeyProvider
  /** Your Malga account identifier (the same `X-Client-Id` used to create the sub-key). */
  clientId: string
  options: MalgaOptions
}
