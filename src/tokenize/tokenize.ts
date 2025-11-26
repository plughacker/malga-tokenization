import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import { submit } from 'src/iframes'
import {
  MalgaConfigurations,
  MalgaPayloadResponse,
  MalgaFieldsGroup,
} from 'src/interfaces'
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

    return origin === allowedOrigin
  }

  private getFilledCards(): MalgaFieldsGroup[] {
    const requiredFields = [
      'cardNumber',
      'cardHolderName',
      'cardCvv',
      'cardExpirationDate',
    ]

    return this.configurations.options.config.fields.filter((field) => {
      const container = field.cardNumber.container
      const storageKey = `malga-card-${container}`
      const cardData = JSON.parse(sessionStorage.getItem(storageKey) || '{}')

      const isFilled = requiredFields.every((fieldName) => {
        const value = cardData[fieldName]
        return (
          value !== undefined &&
          value !== null &&
          typeof value === 'string' &&
          value.trim().length > 0
        )
      })

      if (!isFilled) {
        sessionStorage.removeItem(storageKey)
      }

      return isFilled
    })
  }

  public async handle(): Promise<MalgaPayloadResponse[]> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    const filledCards = this.getFilledCards()

    if (filledCards.length === 0) {
      console.log('porque não entra aqui?')
      throw new Error(
        'Nenhum cartão está preenchido. Preencha pelo menos um cartão.',
      )
    }

    submit(this.configurations, filledCards)

    const windowData = new EventListener(window)

    return new Promise((resolve, reject) => {
      const results: MalgaPayloadResponse[] = []

      const messageHandler = (event: MessageEvent<MalgaResponse>) => {
        if (!this.isValidOrigin(event.origin)) {
          console.error(
            `Unauthorized origin: ${event.origin}, origin should be ${gettingOriginEvent()}`,
          )
          return
        }

        if (event.data.eventType === Event.Tokenize) {
          try {
            results.push(event.data.data)

            if (results.length === filledCards.length) {
              console.log('results', results)
              resolve(results)
              window.removeEventListener('message', messageHandler)
            }
          } catch (error) {
            console.log('sai aqui?')
            console.error('Error processing tokenize event:', error)
            reject(error)
            window.removeEventListener('message', messageHandler)
          }
        }
      }

      windowData.listener('message', messageHandler)
    })
  }
}
