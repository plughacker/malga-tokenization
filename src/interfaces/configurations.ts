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
   * A string, or a function that returns it (sync or async). With a function,
   * the key is fetched on each `tokenize()` instead of once in the constructor.
   */
  apiKey: string | MalgaApiKeyProvider
  clientId: string
  options: MalgaOptions
}
