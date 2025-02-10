interface MalgaInputFieldStyles {
  input: string
  [key: string]: string
}

export interface MalgaInputFieldConfiguration {
  container: string
  // selector: string
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
  styles?: MalgaInputFieldStyles
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
