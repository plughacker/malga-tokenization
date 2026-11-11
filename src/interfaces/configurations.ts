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
export interface MalgaConfigurations {
  /**
   * Use a sub-key created by your backend, never your secret key.
   * - Create it with POST /v1/auth using only the ["tokens"] scope.
   * - Use a short expiration (e.g. expires: 900) and one sub-key per checkout session.
   * - Don't use expires: 0 and don't hardcode the key in your HTML or front-end bundle.
   * Reference: https://docs.malga.io/api-reference/client-token/criar-nova-chave-publica-para-uso-no-client-side
   */
  apiKey: string
  /** Your Malga account identifier (the same `X-Client-Id` used to create the sub-key). */
  clientId: string
  options: MalgaOptions
}
