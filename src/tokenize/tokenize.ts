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

    console.log('[TOKENIZATION] getFilledCards called')
    console.log('[TOKENIZATION] All sessionStorage keys:', Object.keys(sessionStorage))
    
    // Log all malga-card keys
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('malga-card')) {
        console.log(`[TOKENIZATION] sessionStorage[${key}]:`, sessionStorage.getItem(key))
      }
    })

    return this.configurations.options.config.fields.filter((field) => {
      const container = field.cardNumber.container
      const storageKey = `malga-card-${container}`
      const cardData = JSON.parse(sessionStorage.getItem(storageKey) || '{}')

      console.log(`[TOKENIZATION] Checking card: ${container}`)
      console.log(`[TOKENIZATION] storageKey: ${storageKey}`)
      console.log(`[TOKENIZATION] cardData:`, cardData)

      const fieldChecks = requiredFields.map((fieldName) => {
        const value = cardData[fieldName]
        const isValid = 
          value !== undefined &&
          value !== null &&
          typeof value === 'string' &&
          value.trim().length > 0
        
        console.log(`[TOKENIZATION] Field ${fieldName}: value=${value ? 'EXISTS' : 'MISSING'}, isValid=${isValid}`)
        return isValid
      })

      const isFilled = fieldChecks.every(Boolean)
      console.log(`[TOKENIZATION] Card ${container} isFilled: ${isFilled}`)

      // NÃO remover os dados do sessionStorage aqui!
      // Os dados devem ser preservados para que o usuário possa completar o preenchimento

      return isFilled
    })
  }

  public async handle(): Promise<MalgaPayloadResponse[]> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    const filledCards = this.getFilledCards()

    if (filledCards.length === 0) {
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
              resolve(results)
              window.removeEventListener('message', messageHandler)
            }
          } catch (error) {
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
