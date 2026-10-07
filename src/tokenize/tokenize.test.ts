import { Event } from 'src/enums'
import type { Events } from 'src/events'
import { submit } from 'src/iframes'
import { Tokenize } from './../tokenize/tokenize'
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

  test('should reject when the card number iframe is not found', async () => {
    handleRemoveIframe(iframe)

    await expect(
      new Tokenize(configSDKEachEnvironment(false, false), events).handle(),
    ).rejects.toThrow('Card number iframe not found, cannot tokenize')
  })
})
