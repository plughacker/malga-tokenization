import { Malga } from './common/malga'

import { AsyncTokenize } from './async-tokenize'
import { Tokenize } from './tokenize'

import type {
  MalgaConfigurations,
  MalgaConfigurationsElements,
  MalgaFormElements,
} from 'src/common/interfaces'

export class MalgaTokenization {
  private readonly malga: Malga
  private readonly elements: MalgaFormElements

  constructor(configurations: MalgaConfigurations) {
    if (!configurations.apiKey || !configurations.clientId) {
      console.error(
        'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
      )
    }

    this.malga = new Malga(configurations)
    this.elements = this.handleElements(configurations.options?.elements)
  }

  private handleElements(elements?: MalgaConfigurationsElements) {
    return {
      form: elements?.form || 'data-malga-tokenization-form',
      holderName: elements?.holderName || 'data-malga-tokenization-holder-name',
      cvv: elements?.cvv || 'data-malga-tokenization-cvv',
      expirationDate:
        elements?.expirationDate || 'data-malga-tokenization-expiration-date',
      number: elements?.number || 'data-malga-tokenization-number',
    }
  }

  public async init() {
    const asyncTokenize = new AsyncTokenize(this.malga, this.elements)
    return asyncTokenize.handle()
  }

  public async tokenize() {
    const tokenize = new Tokenize(this.malga, this.elements)
    return tokenize.handle()
  }
}
