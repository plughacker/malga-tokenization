export type MalgaContainer =
  | 'card-number'
  | 'card-holder-name'
  | 'card-expiration-date'
  | 'card-cvv'

export interface MalgaInputFieldConfiguration {
  container: MalgaContainer
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

export interface MalgaConfigurations {
  apiKey: string
  clientId: string
  options: {
    config: MalgaInputFieldConfigurations
    sandbox?: boolean
  }
}
