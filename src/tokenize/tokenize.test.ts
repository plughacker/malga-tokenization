import { Event } from 'src/enums'
import type { Events } from 'src/events'
import { submit } from 'src/iframes'
import {
  API_KEY_TIMEOUT_MS,
  TOKENIZE_TIMEOUT_MS,
  Tokenize,
} from './../tokenize/tokenize'
import * as iframesModule from 'src/iframes'
import {
  handleSetupIframeInDOM,
  handleRemoveIframe,
  handleCreateMessageEventMock,
  configurationsSDK,
  configSDKEachEnvironment,
} from 'tests/mocks'
import {
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

const STORAGE_KEY = 'malga-card-card-number'
const COLLECTED_CARD = {
  cardNumber: 'cifrado-numero',
  cardHolderName: 'cifrado-titular',
  cardExpirationDate: 'cifrado-validade',
  cardCvv: 'cifrado-cvv',
}

describe('tokenize', () => {
  let iframe: HTMLIFrameElement
  let contentWindowMock: Window
  let events: Events

  beforeEach(() => {
    events = { emit: vi.fn() } as unknown as Events
    contentWindowMock = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
    } as unknown as Window

    iframe = handleSetupIframeInDOM('card-number', contentWindowMock)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(COLLECTED_CARD))
  })

  afterEach(() => {
    vi.clearAllMocks()
    handleRemoveIframe(iframe)
    sessionStorage.clear()
  })

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should resolve with token data on successful message',
    async ({ url, debug, sandbox }) => {
      const tokenize = new Tokenize(
        configSDKEachEnvironment(debug, sandbox),
        events,
      )
      const promise = tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        url,
        '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
        contentWindowMock,
      )

      global.dispatchEvent(messageEvent)

      const response = await promise

      expect(response).toEqual({
        tokenId: '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
      })

      expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
    },
  )

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should handle error for undefined data',
    async ({ url, debug, sandbox }) => {
      const tokenize = new Tokenize(
        configSDKEachEnvironment(debug, sandbox),
        events,
      )

      const promise = tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        url,
        undefined,
        contentWindowMock,
      )

      global.dispatchEvent(messageEvent)

      const response = await promise
      expect(response).toEqual({
        tokenId: undefined,
      })

      expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
    },
  )

  test.each`
    debug    | sandbox
    ${true}  | ${false}
    ${false} | ${true}
    ${false} | ${false}
  `(
    'should ignore messages from different origins',
    async ({ debug, sandbox }) => {
      const tokenize = new Tokenize(
        configSDKEachEnvironment(debug, sandbox),
        events,
      )

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        'https://wrong-origin.com',
        '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
        contentWindowMock,
      )

      global.dispatchEvent(messageEvent)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Unauthorized origin: https://wrong-origin.com, origin should be https://hosted-fields.malga.io`,
      )

      expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
      consoleErrorSpy.mockRestore()
    },
  )

  test.each`
    debug    | sandbox
    ${true}  | ${false}
    ${false} | ${true}
    ${false} | ${false}
  `(
    'should call submit with any environment configurations (debug, sandbox, prod)',
    ({ debug, sandbox }) => {
      const submitSpy = vi.spyOn(iframesModule, 'submit')

      new Tokenize(configSDKEachEnvironment(debug, sandbox), events).handle()

      expect(submitSpy).toHaveBeenCalledWith(
        configSDKEachEnvironment(debug, sandbox),
        expect.any(String),
      )

      submitSpy.mockRestore()
    },
  )

  test('should show error when iframeCardNumber is not found', () => {
    handleRemoveIframe(iframe)

    const consoleErrorSpy = vi.spyOn(console, 'error')

    submit(configurationsSDK)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'iframeCardNumber is null or has no contentWindow, cannot send postMessage',
    )

    consoleErrorSpy.mockRestore()
  })

  test('should ignore tokenize messages coming from another iframe', async () => {
    const tokenize = new Tokenize(
      configSDKEachEnvironment(false, false),
      events,
    )
    const promise = tokenize.handle()
    const otherWindow = { postMessage: vi.fn() }

    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_PROD,
        'token-from-other-instance',
        otherWindow,
      ),
    )
    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_PROD,
        'token-from-this-instance',
        contentWindowMock,
      ),
    )

    expect(await promise).toEqual({ tokenId: 'token-from-this-instance' })
  })

  test('should emit loading while tokenizing', async () => {
    const promise = new Tokenize(
      configSDKEachEnvironment(false, false),
      events,
    ).handle()

    expect(events.emit).toHaveBeenCalledTimes(1)
    expect(events.emit).toHaveBeenCalledWith(Event.Loading, { isLoading: true })

    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_PROD,
        '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
        contentWindowMock,
      ),
    )
    await promise

    expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
      isLoading: false,
    })
  })

  test('should not emit loading when the card number iframe is not found', async () => {
    handleRemoveIframe(iframe)

    await expect(
      new Tokenize(configSDKEachEnvironment(false, false), events).handle(),
    ).rejects.toThrow()

    expect(events.emit).not.toHaveBeenCalled()
  })

  test('should resolve each call with the response of its own request', async () => {
    const config = configSDKEachEnvironment(false, false)
    const first = new Tokenize(config, events).handle()
    const second = new Tokenize(config, events).handle()

    const postMessage = vi.mocked(contentWindowMock.postMessage)
    const [firstRequestId, secondRequestId] = postMessage.mock.calls.map(
      ([message]) => message.data.requestId,
    )

    expect(firstRequestId).not.toBe(secondRequestId)

    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_PROD,
        'token-second',
        contentWindowMock,
        secondRequestId,
      ),
    )
    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_PROD,
        'token-first',
        contentWindowMock,
        firstRequestId,
      ),
    )

    expect(await first).toEqual({ tokenId: 'token-first' })
    expect(await second).toEqual({ tokenId: 'token-second' })
  })

  test('should send the requestId in the submit message', () => {
    new Tokenize(configSDKEachEnvironment(false, false), events).handle()

    expect(contentWindowMock.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requestId: expect.any(String) }),
      }),
      URL_HOSTED_FIELD_PROD,
    )
  })

  test('should resolve with a timeout error and stop loading when the iframe never answers', async () => {
    vi.useFakeTimers()

    try {
      const promise = new Tokenize(
        configSDKEachEnvironment(false, false),
        events,
      ).handle()

      await vi.advanceTimersByTimeAsync(TOKENIZE_TIMEOUT_MS - 1)
      expect(events.emit).not.toHaveBeenCalledWith(Event.Loading, {
        isLoading: false,
      })

      await vi.advanceTimersByTimeAsync(1)

      expect(await promise).toEqual({
        tokenId: '',
        error: {
          type: 'timeout',
          code: 0,
          message: expect.stringContaining(`${TOKENIZE_TIMEOUT_MS}ms`),
        },
      })
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  test('should reject when the card number iframe is not found', async () => {
    handleRemoveIframe(iframe)

    await expect(
      new Tokenize(configSDKEachEnvironment(false, false), events).handle(),
    ).rejects.toThrow('Card number iframe not found, cannot tokenize')
  })

  test('should not send anything when no field was filled, naming every field', async () => {
    sessionStorage.removeItem(STORAGE_KEY)

    const result = await new Tokenize(configurationsSDK, events).handle()

    expect(result).toEqual({
      tokenId: '',
      error: {
        type: 'invalid_request_error',
        code: 0,
        message: expect.stringContaining('Missing card data'),
        details: [
          'cardNumber',
          'cardHolderName',
          'cardExpirationDate',
          'cardCvv',
        ],
      },
    })
    expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
    expect(events.emit).not.toHaveBeenCalled()
  })

  test('should name only the missing fields when the card is partially filled', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...COLLECTED_CARD,
        cardCvv: '',
        cardHolderName: undefined,
      }),
    )

    const result = await new Tokenize(configurationsSDK, events).handle()

    expect(result.error.details).toEqual(['cardHolderName', 'cardCvv'])
    expect(result.error.message).toContain('cardHolderName, cardCvv')
    expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
  })

  test('should only require the fields configured in the instance', async () => {
    const fields: Partial<typeof configurationsSDK.options.config.fields> = {
      ...configurationsSDK.options.config.fields,
    }
    delete fields.cardHolderName
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...COLLECTED_CARD, cardHolderName: '' }),
    )
    const configurations = {
      ...configurationsSDK,
      options: {
        ...configurationsSDK.options,
        config: { ...configurationsSDK.options.config, fields },
      },
    } as typeof configurationsSDK

    new Tokenize(configurations, events).handle()

    expect(contentWindowMock.postMessage).toHaveBeenCalled()
  })

  test('should still reject when the card number iframe is not found, before checking the fields', async () => {
    handleRemoveIframe(iframe)
    sessionStorage.removeItem(STORAGE_KEY)

    await expect(
      new Tokenize(configSDKEachEnvironment(false, false), events).handle(),
    ).rejects.toThrow('Card number iframe not found, cannot tokenize')
  })
  describe('apiKey as a function', () => {
    const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

    const withApiKey = (apiKey: () => string | Promise<string>) => ({
      ...configSDKEachEnvironment(false, false),
      apiKey,
    })

    const sentApiKey = () => {
      const [[message]] = vi.mocked(contentWindowMock.postMessage).mock.calls
      return message.data.authorizationData.apiKey
    }

    const answerTokenize = (tokenId: string) =>
      global.dispatchEvent(
        handleCreateMessageEventMock(
          Event.Tokenize,
          URL_HOSTED_FIELD_PROD,
          tokenId,
          contentWindowMock,
        ),
      )

    test('should send the key returned by a sync function', async () => {
      const promise = new Tokenize(
        withApiKey(() => 'sync-sub-key'),
        events,
      ).handle()
      await flushPromises()

      expect(sentApiKey()).toBe('sync-sub-key')

      answerTokenize('token-sync')
      expect(await promise).toEqual({ tokenId: 'token-sync' })
    })

    test('should wait for an async function before sending the card, with loading on while it runs', async () => {
      let resolveApiKey!: (apiKey: string) => void
      const apiKeyProvider = vi.fn(
        () => new Promise<string>((resolve) => (resolveApiKey = resolve)),
      )

      const promise = new Tokenize(withApiKey(apiKeyProvider), events).handle()
      await flushPromises()

      expect(apiKeyProvider).toHaveBeenCalledTimes(1)
      expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
      expect(events.emit).toHaveBeenCalledTimes(1)
      expect(events.emit).toHaveBeenCalledWith(Event.Loading, {
        isLoading: true,
      })

      resolveApiKey('async-sub-key')
      await flushPromises()

      expect(sentApiKey()).toBe('async-sub-key')

      answerTokenize('token-async')
      expect(await promise).toEqual({ tokenId: 'token-async' })
      expect(events.emit).toHaveBeenCalledTimes(2)
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    })

    test('should call the function on every tokenize', async () => {
      const apiKeyProvider = vi
        .fn()
        .mockResolvedValueOnce('first-sub-key')
        .mockResolvedValueOnce('second-sub-key')
      const config = withApiKey(apiKeyProvider)

      const first = new Tokenize(config, events).handle()
      await flushPromises()
      answerTokenize('token-first')
      await first

      const second = new Tokenize(config, events).handle()
      await flushPromises()
      answerTokenize('token-second')
      await second

      const sentKeys = vi
        .mocked(contentWindowMock.postMessage)
        .mock.calls.map(([message]) => message.data.authorizationData.apiKey)

      expect(apiKeyProvider).toHaveBeenCalledTimes(2)
      expect(sentKeys).toEqual(['first-sub-key', 'second-sub-key'])
    })

    test('should resolve with an error, without sending the card, when the function throws', async () => {
      const response = await new Tokenize(
        withApiKey(() => Promise.reject(new Error('backend unavailable'))),
        events,
      ).handle()

      expect(response).toEqual({
        tokenId: '',
        error: {
          type: 'invalid_request_error',
          code: 0,
          message:
            'Could not get the API key: the apiKey function threw an error',
        },
      })
      expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    })

    test('should log the error of the function only with debug', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      const backendError = new Error('backend unavailable')
      const failingApiKey = () => Promise.reject(backendError)

      await new Tokenize(withApiKey(failingApiKey), events).handle()
      expect(consoleError).not.toHaveBeenCalled()

      const response = await new Tokenize(
        {
          ...configSDKEachEnvironment(true, false),
          apiKey: failingApiKey,
        },
        events,
      ).handle()
      expect(consoleError).toHaveBeenCalledWith(
        'MalgaTokenization: the apiKey function failed',
        backendError,
      )
      expect(response.error.message).not.toContain('backend unavailable')

      consoleError.mockRestore()
    })

    test('should resolve with an error when the function returns an empty key', async () => {
      const response = await new Tokenize(
        withApiKey(() => ''),
        events,
      ).handle()

      expect(response.error).toEqual(
        expect.objectContaining({
          type: 'invalid_request_error',
          message:
            'Could not get the API key: the apiKey function must return a non-empty string',
        }),
      )
      expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
    })

    test('should not call the function when a configured field is empty', async () => {
      sessionStorage.clear()
      const apiKeyProvider = vi.fn(() => 'sub-key')

      const response = await new Tokenize(
        withApiKey(apiKeyProvider),
        events,
      ).handle()

      expect(response.error.type).toBe('invalid_request_error')
      expect(apiKeyProvider).not.toHaveBeenCalled()
    })

    test('should stop loading when sending the card throws', async () => {
      vi.mocked(contentWindowMock.postMessage).mockImplementation(() => {
        throw new Error('postMessage failed')
      })

      await expect(
        new Tokenize(
          withApiKey(async () => 'sub-key'),
          events,
        ).handle(),
      ).rejects.toThrow('postMessage failed')
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    })

    test('should reject without sending the card when the instance is no longer active after the key is fetched', async () => {
      let resolveApiKey!: (apiKey: string) => void
      let isActive = true
      const promise = new Tokenize(
        withApiKey(
          () => new Promise<string>((resolve) => (resolveApiKey = resolve)),
        ),
        events,
        () => isActive,
      ).handle()
      await flushPromises()

      isActive = false
      resolveApiKey('sub-key')

      await expect(promise).rejects.toThrow(
        'the instance was destroyed or its card fields were replaced',
      )
      expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    })

    test('should resolve with a timeout error when the function never answers, ignoring a late key', async () => {
      vi.useFakeTimers()

      try {
        let resolveApiKey!: (apiKey: string) => void
        const promise = new Tokenize(
          withApiKey(
            () => new Promise<string>((resolve) => (resolveApiKey = resolve)),
          ),
          events,
        ).handle()

        await vi.advanceTimersByTimeAsync(API_KEY_TIMEOUT_MS)

        expect(await promise).toEqual({
          tokenId: '',
          error: {
            type: 'timeout',
            code: 0,
            message: `Could not get the API key: no answer from the apiKey function after ${API_KEY_TIMEOUT_MS}ms`,
          },
        })
        expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
          isLoading: false,
        })

        resolveApiKey('late-sub-key')
        await vi.advanceTimersByTimeAsync(0)

        expect(contentWindowMock.postMessage).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    test('should reject and stop loading when the iframe leaves the page while the key is fetched', async () => {
      let resolveApiKey!: (apiKey: string) => void
      const promise = new Tokenize(
        withApiKey(
          () => new Promise<string>((resolve) => (resolveApiKey = resolve)),
        ),
        events,
      ).handle()
      await flushPromises()

      handleRemoveIframe(iframe)
      resolveApiKey('sub-key')

      await expect(promise).rejects.toThrow(
        'Card number iframe not found, cannot tokenize',
      )
      expect(events.emit).toHaveBeenLastCalledWith(Event.Loading, {
        isLoading: false,
      })
    })
  })
})
