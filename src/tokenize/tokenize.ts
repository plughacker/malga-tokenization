import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import { submit } from 'src/iframes'
import { MalgaConfigurations, MalgaPayloadResponse } from 'src/interfaces'
import { URL_HOSTED_FIELD } from '../constants'

export class Tokenize {
  private readonly allowedOrigins = URL_HOSTED_FIELD

  constructor(private readonly configurations: MalgaConfigurations) {}

  private isValidOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin)
  }

  public async handle(): Promise<MalgaPayloadResponse> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    submit(this.configurations)

    const windowData = new EventListener(window)

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        if (!this.isValidOrigin(event.origin)) {
          console.error('Unauthorized origin:', event.origin)
          return reject(new Error('Unauthorized origin'))
        }

        if (event.data.type === Event.Tokenize) {
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
