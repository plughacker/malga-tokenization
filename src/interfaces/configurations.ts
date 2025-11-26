export interface MalgaInputFieldConfiguration {
  container: string
  placeholder?: string
  type?: string
  needMask?: boolean
  defaultValidation?: boolean
}

export interface MalgaFieldsGroup {
  cardNumber: MalgaInputFieldConfiguration
  cardHolderName: MalgaInputFieldConfiguration
  cardCvv: MalgaInputFieldConfiguration
  cardExpirationDate: MalgaInputFieldConfiguration
}

export interface MalgaInputFieldConfigurations {
  fields: MalgaFieldsGroup[]
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
