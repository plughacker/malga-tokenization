export interface MalgaConfigurationsElements {
  form?: string
  holderName?: string
  cvv?: string
  expirationDate?: string
  number?: string
}

interface FieldStyles {
  input: string
  [key: string]: string
}

interface FieldOptions {
  container: string | HTMLElement
  selector: string
  placeholder?: string
  stylesField?: FieldStyles
  type?: string
}

export interface MalgaConfigurations {
  apiKey: string
  clientId: string
  config: {
    fields: {
      cardNumber: FieldOptions
      cardHolderName: FieldOptions
      cardCvv: FieldOptions
      cardExpirationDate: FieldOptions
    }
    styles?: {}
    preventAutofill?: boolean
  }
  options?: {
    sandbox?: boolean
    elements?: MalgaConfigurationsElements
  }
}
