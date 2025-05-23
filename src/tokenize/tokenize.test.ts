import { Event } from 'src/enums'
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
