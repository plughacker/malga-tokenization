export type MalgaCreditCardFields =
  | 'card-number'
  | 'card-holder-name'
  | 'card-expiration-date'
  | 'card-cvv'

export interface MalgaInputFieldConfiguration {
  container: MalgaCreditCardFields
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
  apiKey: string
  clientId: string
  options: MalgaOptions
}
