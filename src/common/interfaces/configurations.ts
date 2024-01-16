export interface MalgaConfigurationsElements {
  form?: string
  holderName?: string
  cvv?: string
  expirationDate?: string
  number?: string
}

export interface MalgaConfigurations {
  apiKey: string
  clientId: string
  options?: {
    sandbox?: boolean
    elements?: MalgaConfigurationsElements
  }
}
