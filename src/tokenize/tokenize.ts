import { TOKENIZE_TIMEOUT_MS } from 'src/constants'
import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import { submit } from 'src/iframes'
import { MalgaConfigurations, MalgaPayloadResponse } from 'src/interfaces'
import { generateRequestId, gettingOriginEvent } from 'src/utils'
import { TokenizeTimeoutError } from './errors'

interface MalgaResponsePayload extends MalgaPayloadResponse {
  requestId?: string
}

interface MalgaResponse {
  eventType: Event
  data: MalgaResponsePayload
  requestId?: string
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

  /**
   * O identificador da requisição pode chegar dentro do payload da resposta ou
   * ao lado dele, dependendo da versão do iframe que está publicada.
   */
  private getResponseRequestId(response: MalgaResponse): string | undefined {
    return response.data?.requestId ?? response.requestId
  }

  /**
   * Uma resposta pertence a esta chamada quando traz o mesmo identificador que
   * foi enviado na submissão. Iframes antigos não devolvem identificador
   * nenhum: nesse caso a resposta é aceita, preservando o comportamento atual.
   */
  private isOwnResponse(response: MalgaResponse, requestId: string): boolean {
    const responseRequestId = this.getResponseRequestId(response)

    if (!responseRequestId) {
      return true
    }

    return responseRequestId === requestId
  }

  public async handle(): Promise<MalgaPayloadResponse> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    const requestId = generateRequestId()

    submit(this.configurations, requestId)

    const windowData = new EventListener(window)

    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>

      const cleanup = () => {
        clearTimeout(timeoutId)
        windowData.remove('message', messageHandler)
      }

      const messageHandler = (event: MessageEvent<MalgaResponse>) => {
        if (!this.isValidOrigin(event.origin)) {
          console.error(
            `Unauthorized origin: ${event.origin}, origin should be ${gettingOriginEvent()}`,
          )
          return
        }

        if (event.data?.eventType !== Event.Tokenize) {
          return
        }

        // Resposta de outra chamada de tokenização: ignorada, não consumida.
        if (!this.isOwnResponse(event.data, requestId)) {
          return
        }

        try {
          resolve(this.getPayload(event.data.data))
        } catch (error) {
          console.error('Error processing tokenize event:', error)
          reject(error)
        } finally {
          cleanup()
        }
      }

      timeoutId = setTimeout(() => {
        cleanup()
        reject(new TokenizeTimeoutError(TOKENIZE_TIMEOUT_MS))
      }, TOKENIZE_TIMEOUT_MS)

      windowData.listener('message', messageHandler)
    })
  }

  /**
   * O identificador é detalhe de transporte: o merchant continua recebendo o
   * mesmo formato de sempre.
   */
  private getPayload(payload: MalgaResponsePayload): MalgaPayloadResponse {
    if (!payload || !('requestId' in payload)) {
      return payload
    }

    const response = { ...payload }
    delete response.requestId

    return response
  }
}
