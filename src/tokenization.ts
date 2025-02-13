import type { MalgaConfigurations } from 'src/common/interfaces'

import { Tokenize } from './tokenize'
import { Events, loaded } from './common/utils'
import { change } from './common/utils/form-iframes/change'

export const eventsEmitter = new Events()

export class MalgaTokenization {
  private readonly configurations: MalgaConfigurations

  constructor(configurations: MalgaConfigurations) {
    if (!configurations.apiKey || !configurations.clientId) {
      console.error(
        'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
      )
    }

    this.configurations = configurations

    loaded(configurations.options?.config)
    change()
  }

  public async tokenize() {
    const tokenize = new Tokenize(this.configurations)
    return tokenize.handle()
  }

  public on(type: string, eventHandler: (event: any) => void) {
    return eventsEmitter.on(type, eventHandler)
  }
}
