import { Malga } from './common/malga'

import type { MalgaConfigurations } from 'src/common/interfaces'

import { Tokenize } from './tokenize'
import { AsyncTokenize } from './async-tokenize'
import { loaded } from './common/utils'

export class MalgaTokenization {
  private readonly malga: Malga

  constructor(configurations: MalgaConfigurations) {
    if (!configurations.apiKey || !configurations.clientId) {
      console.error(
        'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
      )
    }

    this.malga = new Malga(configurations)

    loaded(configurations.config)
  }

  public async init() {
    const asyncTokenize = new AsyncTokenize(this.malga)
    return asyncTokenize.handle()
  }

  public async tokenize() {
    const tokenize = new Tokenize(this.malga)
    return tokenize.handle()
  }
}
