import type { Mock } from 'vitest'
import { Event } from 'src/enums'
import { submit } from 'src/iframes'
import { Tokenize } from './../tokenize/tokenize'
import { TokenizeTimeoutError } from './errors'
import * as iframesModule from 'src/iframes'
import {
  handleSetupIframeInDOM,
  handleRemoveIframe,
  handleCreateMessageEventMock,
  configurationsSDK,
  configSDKEachEnvironment,
} from 'tests/mocks'
import {
  TOKENIZE_TIMEOUT_MS,
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

describe('tokenize', () => {
  let iframe: HTMLIFrameElement
  let contentWindowMock: Window

  beforeEach(() => {
    contentWindowMock = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
    } as unknown as Window

    iframe = handleSetupIframeInDOM('card-number', contentWindowMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
    handleRemoveIframe(iframe)
  })

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should resolve with token data on successful message',
    async ({ url, debug, sandbox }) => {
      const tokenize = new Tokenize(configSDKEachEnvironment(debug, sandbox))
      const promise = tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        url,
        '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
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
      const tokenize = new Tokenize(configSDKEachEnvironment(debug, sandbox))

      const promise = tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        url,
        undefined,
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
      const tokenize = new Tokenize(configSDKEachEnvironment(debug, sandbox))

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      tokenize.handle()

      const messageEvent = handleCreateMessageEventMock(
        Event.Tokenize,
        'https://wrong-origin.com',
        '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
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

      new Tokenize(configSDKEachEnvironment(debug, sandbox)).handle()

      expect(submitSpy).toHaveBeenCalledWith(
        configSDKEachEnvironment(debug, sandbox),
        expect.any(String),
      )

      submitSpy.mockRestore()
    },
  )

  test('should show error when iframeCardNumber is not found', () => {
    const querySelectorSpy = vi.spyOn(document, 'querySelector')

    querySelectorSpy.mockReturnValue(null)

    const consoleErrorSpy = vi.spyOn(console, 'error')

    submit(configurationsSDK)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'iframeCardNumber is null or has no contentWindow, cannot send postMessage',
    )

    querySelectorSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})

/**
 * Regressão do bug em que duas ou mais tokenizações simultâneas resolviam
 * todas com o primeiro token que chegasse na window. Ponto de partida: o probe
 * que mediu o problema em produção (três cartões, três tokens distintos na
 * API, o primeiro devolvido para os três).
 */
describe('tokenize request correlation', () => {
  let iframe: HTMLIFrameElement
  let contentWindowMock: Window

  const configurations = configSDKEachEnvironment(true, false)

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  function sentRequestIds(): string[] {
    const postMessage = contentWindowMock.postMessage as unknown as Mock

    return postMessage.mock.calls.map(([message]) => message.data.requestId)
  }

  function respondWith(tokenId: string, requestId?: string) {
    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        URL_HOSTED_FIELD_DEV,
        tokenId,
        requestId,
      ),
    )
  }

  function registeredMessageHandler(addEventListenerSpy: Mock) {
    const call = addEventListenerSpy.mock.calls.find(
      ([eventType]) => eventType === 'message',
    )

    return call?.[1]
  }

  beforeEach(() => {
    contentWindowMock = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
    } as unknown as Window

    iframe = handleSetupIframeInDOM('card-number', contentWindowMock)

    // Tokenizações pendentes de testes anteriores ainda escutam a window e
    // reclamam da origem destes eventos. O ruído não interessa aqui.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.useRealTimers()
    vi.clearAllMocks()
    handleRemoveIframe(iframe)
  })

  test('should send a distinct request identifier on every submission', () => {
    new Tokenize(configurations).handle()
    new Tokenize(configurations).handle()
    new Tokenize(configurations).handle()

    const requestIds = sentRequestIds()

    expect(requestIds).toHaveLength(3)
    expect(requestIds.every((requestId) => !!requestId)).toBe(true)
    expect(new Set(requestIds).size).toBe(3)
  })

  test('should give each concurrent tokenization its own token', async () => {
    const first = new Tokenize(configurations).handle()
    const second = new Tokenize(configurations).handle()
    const third = new Tokenize(configurations).handle()

    const [firstId, secondId, thirdId] = sentRequestIds()

    // As respostas voltam fora de ordem, como acontece quando três cartões
    // tokenizam ao mesmo tempo.
    respondWith('TOKEN-C', thirdId)
    respondWith('TOKEN-A', firstId)
    respondWith('TOKEN-B', secondId)

    await expect(Promise.all([first, second, third])).resolves.toEqual([
      { tokenId: 'TOKEN-A' },
      { tokenId: 'TOKEN-B' },
      { tokenId: 'TOKEN-C' },
    ])
  })

  test('should keep sequential tokenizations correct', async () => {
    const first = new Tokenize(configurations).handle()
    respondWith('TOKEN-A', sentRequestIds()[0])
    await expect(first).resolves.toEqual({ tokenId: 'TOKEN-A' })

    const second = new Tokenize(configurations).handle()
    respondWith('TOKEN-B', sentRequestIds()[1])
    await expect(second).resolves.toEqual({ tokenId: 'TOKEN-B' })
  })

  test('should ignore a response that belongs to another tokenization', async () => {
    const promise = new Tokenize(configurations).handle()
    const [requestId] = sentRequestIds()

    respondWith('TOKEN-FROM-ANOTHER-CALL', 'some-other-request-id')
    respondWith('TOKEN-A', requestId)

    await expect(promise).resolves.toEqual({ tokenId: 'TOKEN-A' })
  })

  test('should accept a response that carries no request identifier', async () => {
    const promise = new Tokenize(configurations).handle()

    respondWith('TOKEN-A')

    await expect(promise).resolves.toEqual({ tokenId: 'TOKEN-A' })
  })

  test('should accept a response whose identifier travels beside the payload', async () => {
    const promise = new Tokenize(configurations).handle()
    const [requestId] = sentRequestIds()

    global.dispatchEvent(
      new MessageEvent('message', {
        origin: URL_HOSTED_FIELD_DEV,
        data: {
          eventType: Event.Tokenize,
          requestId,
          data: { tokenId: 'TOKEN-A' },
        },
      }),
    )

    await expect(promise).resolves.toEqual({ tokenId: 'TOKEN-A' })
  })

  test('should reject with a named error when no response ever arrives', async () => {
    vi.useFakeTimers()

    const promise = new Tokenize(configurations).handle()
    const rejection = expect(promise).rejects.toMatchObject({
      name: 'TokenizeTimeoutError',
    })

    await vi.advanceTimersByTimeAsync(TOKENIZE_TIMEOUT_MS)

    await rejection
  })

  test('should not leave a listener registered after resolving', async () => {
    const addEventListenerSpy = vi.spyOn(
      window,
      'addEventListener',
    ) as unknown as Mock
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const promise = new Tokenize(configurations).handle()
    respondWith('TOKEN-A', sentRequestIds()[0])

    await promise

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      registeredMessageHandler(addEventListenerSpy),
    )
  })

  test('should not leave a listener registered when the origin is refused', async () => {
    vi.useFakeTimers()

    const addEventListenerSpy = vi.spyOn(
      window,
      'addEventListener',
    ) as unknown as Mock
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const promise = new Tokenize(configurations).handle()
    const rejection =
      expect(promise).rejects.toBeInstanceOf(TokenizeTimeoutError)

    global.dispatchEvent(
      handleCreateMessageEventMock(
        Event.Tokenize,
        'https://wrong-origin.com',
        'TOKEN-A',
      ),
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unauthorized origin: https://wrong-origin.com, origin should be https://hosted-fields.malga.io',
    )

    await vi.advanceTimersByTimeAsync(TOKENIZE_TIMEOUT_MS)

    await rejection

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      registeredMessageHandler(addEventListenerSpy),
    )
  })
})
