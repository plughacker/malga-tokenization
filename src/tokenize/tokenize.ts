import { Event } from 'src/enums'
import { EventListener } from 'src/events'
import type { Events } from 'src/events'
import { getCardNumberIframe, submit } from 'src/iframes'
import {
  MalgaApiKeyProvider,
  MalgaConfigurations,
  MalgaPayloadResponse,
} from 'src/interfaces'
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
export const API_KEY_TIMEOUT_MS = 30000

const INSTANCE_CHANGED_MESSAGE =
  'MalgaTokenization: the instance was destroyed or its card fields were replaced while the API key was fetched'

export class Tokenize {
  constructor(
    private readonly configurations: MalgaConfigurations,
    private readonly events: Events,
    private readonly isActive: () => boolean = () => true,
  ) {}

  private isValidOrigin(origin: string): boolean {
    const allowedOrigin = gettingOriginEvent(
      this.configurations.options?.debug,
      this.configurations.options?.sandbox,
    )

    return origin === allowedOrigin
  }

  private apiKeyFailure(
    type: 'invalid_request_error' | 'timeout',
    reason: string,
  ): MalgaPayloadResponse {
    return {
      tokenId: '',
      error: {
        type,
        code: 0,
        message: `Could not get the API key: ${reason}`,
      },
    }
  }

  private async resolveApiKey(
    apiKeyProvider: MalgaApiKeyProvider,
  ): Promise<string | MalgaPayloadResponse> {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const deadline = new Promise<MalgaPayloadResponse>((resolve) => {
      timeout = setTimeout(
        () =>
          resolve(
            this.apiKeyFailure(
              'timeout',
              `no answer from the apiKey function after ${API_KEY_TIMEOUT_MS}ms`,
            ),
          ),
        API_KEY_TIMEOUT_MS,
      )
    })

    const provided = (async () => {
      try {
        const apiKey = await apiKeyProvider()

        if (typeof apiKey !== 'string' || apiKey.length === 0) {
          return this.apiKeyFailure(
            'invalid_request_error',
            'the apiKey function must return a non-empty string',
          )
        }

        return apiKey
      } catch (error) {
        // a mensagem do backend do integrador não vai no payload, só no console com debug
        if (this.configurations.options?.debug) {
          console.error('MalgaTokenization: the apiKey function failed', error)
        }

        return this.apiKeyFailure(
          'invalid_request_error',
          'the apiKey function threw an error',
        )
      }
    })()

    try {
      // A key that arrives after the deadline is ignored.
      return await Promise.race([provided, deadline])
    } finally {
      clearTimeout(timeout)
    }
  }

  private missingFieldsResponse(): MalgaPayloadResponse | undefined {
    // Sem os dados de algum campo configurado, a API receberia um payload
    // incompleto e devolveria um erro genérico. Aqui o erro nomeia o que falta,
    // sem requisição.
    const missingFields = getMissingCardFields(this.configurations.options)
    if (missingFields.length === 0) return undefined

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

  public async handle(): Promise<MalgaPayloadResponse> {
    if (!this.configurations) {
      throw new Error('Configurations are required')
    }

    const cardNumberIframe = getCardNumberIframe(this.configurations)
    if (!cardNumberIframe?.contentWindow) {
      throw new Error('Card number iframe not found, cannot tokenize')
    }

    const missingFields = this.missingFieldsResponse()
    if (missingFields) return missingFields

    const { apiKey } = this.configurations

    if (typeof apiKey !== 'function') {
      const requestId = generateRequestId()
      const iframeWindow = submit(this.configurations, requestId)

      if (!iframeWindow) {
        throw new Error('Card number iframe not found, cannot tokenize')
      }

      this.events.emit(Event.Loading, { isLoading: true })
      return this.waitForResponse(iframeWindow, requestId)
    }

    // With a function, loading starts while the key is fetched.
    this.events.emit(Event.Loading, { isLoading: true })
    const stopLoading = () =>
      this.events.emit(Event.Loading, { isLoading: false })

    let requestId: string
    let iframeWindow: Window | undefined

    try {
      const resolvedApiKey = await this.resolveApiKey(apiKey)
      if (typeof resolvedApiKey !== 'string') {
        stopLoading()
        return resolvedApiKey
      }

      // The page may have changed while the key was fetched.
      const currentIframe = getCardNumberIframe(this.configurations)
      if (!currentIframe?.contentWindow) {
        throw new Error('Card number iframe not found, cannot tokenize')
      }
      if (!this.isActive() || currentIframe !== cardNumberIframe) {
        throw new Error(INSTANCE_CHANGED_MESSAGE)
      }

      const missingFieldsAfterKey = this.missingFieldsResponse()
      if (missingFieldsAfterKey) {
        stopLoading()
        return missingFieldsAfterKey
      }

      requestId = generateRequestId()
      iframeWindow = submit(
        { ...this.configurations, apiKey: resolvedApiKey },
        requestId,
      )
      if (!iframeWindow) {
        throw new Error('Card number iframe not found, cannot tokenize')
      }
    } catch (error) {
      stopLoading()
      throw error
    }

    return this.waitForResponse(iframeWindow, requestId)
  }

  private waitForResponse(
    iframeWindow: Window,
    requestId: string,
  ): Promise<MalgaPayloadResponse> {
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
