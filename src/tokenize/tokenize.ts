import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import { submit } from 'src/iframes'
import { MalgaConfigurations, MalgaPayloadResponse } from 'src/interfaces'
import { gettingOriginEvent } from 'src/utils'

interface MalgaResponse {
  eventType: Event
  data: MalgaPayloadResponse
}

export class Tokenize {
  constructor(private readonly configurations: MalgaConfigurations) {}

  private isValidOrigin(origin: string): boolean {
    const allowedOrigin = gettingOriginEvent(
      this.configurations.options?.debug,
      this.configurations.options?.sandbox,
    )
    console.log('dentro do envio do submit', origin, allowedOrigin)
    return origin === allowedOrigin
  }

  public async handle(): Promise<MalgaPayloadResponse> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    submit(this.configurations)

    const windowData = new EventListener(window)

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent<MalgaResponse>) => {
        if (!this.isValidOrigin(event.origin)) {
          const allowedOrigin = gettingOriginEvent(
            this.configurations.options?.debug,
            this.configurations.options?.sandbox,
          )
          console.log({ allowedOrigin })
          console.error(
            `Unauthorized origin: ${event.origin}. Expected: ${allowedOrigin}`,
          )
          return reject(new Error(`Unauthorized origin: ${event.origin}`))
        }

        if (event.data.eventType === Event.Tokenize) {
          try {
            resolve(event.data.data)
          } catch (error) {
            console.error('Error processing tokenize event:', error)
            reject(error)
          } finally {
            window.removeEventListener('message', messageHandler)
          }
        }
      }

      windowData.listener('message', messageHandler)
    })
  }
}
