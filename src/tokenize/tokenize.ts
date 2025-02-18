import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import { submit } from 'src/iframes'
import type { MalgaConfigurations } from 'src/interfaces'

type TokenizeResponse = {
  tokenId: string
  error?: string
}

export class Tokenize {
  constructor(private readonly configurations: MalgaConfigurations) {}

  public async handle(): Promise<TokenizeResponse> {
    submit(this.configurations)

    const windowData = new EventListener(window)

    return new Promise((resolve) => {
      windowData.listener('message', (event) => {
        if (event.origin !== 'https://develop.d3krxmg1839vaa.amplifyapp.com') {
          //URL DA APLICAÇÃO
          return console.error('Unauthorized')
        }

        if (event.data.type === Event.Tokenize) {
          try {
            resolve(event.data.data)
          } catch (error) {
            console.error('Error to send message to Client App', error)
          }
        }
      })
    })
  }
}
