export interface MalgaConfigurationsElements {
  form?: string
  holderName?: string
  cvv?: string
  expirationDate?: string
  number?: string
}

interface MalgaInputFieldStyles {
  input: string
  [key: string]: string
}

interface MalgaInputFieldConfiguration {
  container: string
  selector: string
  placeholder?: string
  stylesField?: MalgaInputFieldStyles
  type?: string
}

export interface MalgaInputFieldConfigurations {
  fields: { [fieldName: string]: MalgaInputFieldConfiguration }
  styles?: MalgaInputFieldStyles
  preventAutofill?: boolean
}

export interface MalgaConfigurations {
  apiKey: string
  clientId: string
  config: MalgaInputFieldConfigurations
  options?: {
    sandbox?: boolean
    elements?: MalgaConfigurationsElements
  }
}
