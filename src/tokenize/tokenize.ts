import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import type { Events } from 'src/events'
import { getCardNumberIframe, submit } from 'src/iframes'
import { MalgaConfigurations, MalgaPayloadResponse } from 'src/interfaces'
import {
  generateRequestId,
  getMissingCardFields,
  gettingOriginEvent,
} from 'src/utils'

interface MalgaResponse {
  eventType: Event
  data: MalgaPayloadResponse
}

export const TOKENIZE_TIMEOUT_MS = 30000

export class Tokenize {
  constructor(
    private readonly configurations: MalgaConfigurations,
    private readonly events: Events,
  ) {}

  private isValidOrigin(origin: string): boolean {
    const allowedOrigin = gettingOriginEvent(
      this.configurations.options?.debug,
      this.configurations.options?.sandbox,
    )

    return origin === allowedOrigin
  }

  public async handle(): Promise<MalgaPayloadResponse> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    if (!getCardNumberIframe(this.configurations)?.contentWindow) {
      throw new Error('Card number iframe not found, cannot tokenize')
    }

    // Sem os dados de algum campo configurado, a API receberia um payload
    // incompleto e devolveria um erro genérico. Aqui o erro nomeia o que falta,
    // sem requisição.
    const missingFields = getMissingCardFields(this.configurations.options)
    if (missingFields.length > 0) {
      return {
        tokenId: '',
        error: {
          type: 'invalid_request_error',
          code: 0,
          message: `Missing card data: ${missingFields.join(', ')}. Fill in every field before tokenizing.`,
          details: missingFields,
        },
      }
    }

    const requestId = generateRequestId()
    const iframeWindow = submit(this.configurations, requestId)

    if (!iframeWindow) {
      throw new Error('Card number iframe not found, cannot tokenize')
    }

    this.events.emit(Event.Loading, { isLoading: true })

    const windowData = new EventListener(window)

    return new Promise((resolve, reject) => {
      const finish = () => {
        clearTimeout(timeout)
        windowData.remove('message', messageHandler)
        this.events.emit(Event.Loading, { isLoading: false })
      }

      const timeout = setTimeout(() => {
        finish()
        resolve({
          tokenId: '',
          error: {
            type: 'timeout',
            code: 0,
            message: `No response from the card number iframe after ${TOKENIZE_TIMEOUT_MS}ms`,
          },
        } as unknown as MalgaPayloadResponse)
      }, TOKENIZE_TIMEOUT_MS)

      const messageHandler = (event: MessageEvent<MalgaResponse>) => {
        if (event.source !== iframeWindow) return

        if (!this.isValidOrigin(event.origin)) {
          console.error(
            `Unauthorized origin: ${event.origin}, origin should be ${gettingOriginEvent()}`,
          )
          return
        }

        if (event.data.eventType === Event.Tokenize) {
          const { requestId: responseRequestId, ...payload } = event.data.data

          if (responseRequestId && responseRequestId !== requestId) return

          try {
            resolve(payload)
          } catch (error) {
            console.error('Error processing tokenize event:', error)
            reject(error)
          } finally {
            finish()
          }
        }
      }

      windowData.listener('message', messageHandler)
    })
  }
}
