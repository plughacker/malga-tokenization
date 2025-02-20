import { Event } from 'src/enums'
import { submit } from 'src/iframes'
import { Tokenize } from './../tokenize/tokenize'
import * as iframesModule from 'src/iframes'
import {
  handleSetupIframeInDOM,
  handleRemoveIframe,
  handleCreateMessageEventMock,
  configurationsSDK,
} from 'tests/mocks'

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

  test('should resolve with token data on successful message', async () => {
    const tokenize = new Tokenize(configurationsSDK)
    const promise = tokenize.handle()
    const messageEvent = handleCreateMessageEventMock(
      Event.Tokenize,
      '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
    )
    global.dispatchEvent(messageEvent)

    const response = await promise
    expect(response).toEqual('623e25e1-9c40-442e-beaa-a9d7b735bdc1')
    expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
  })

  test('should handle error for undefined data', async () => {
    const tokenize = new Tokenize(configurationsSDK)

    const promise = tokenize.handle()

    const messageEvent = handleCreateMessageEventMock(
      Event.Tokenize,
      undefined,
      'https://develop.d3krxmg1839vaa.amplifyapp.com',
    )
    global.dispatchEvent(messageEvent)

    const response = await promise
    expect(response).toEqual(undefined)
    expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
  })

  test('should ignore messages from different origins', async () => {
    const tokenize = new Tokenize(configurationsSDK)
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const promise = tokenize.handle()

    const messageEvent = handleCreateMessageEventMock(
      Event.Tokenize,
      '623e25e1-9c40-442e-beaa-a9d7b735bdc1',
      'https://wrong-origin.com',
    )
    global.dispatchEvent(messageEvent)

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unauthorized')
    expect(promise).not.resolves
    expect(contentWindowMock.postMessage).toHaveBeenCalledTimes(1)
    consoleErrorSpy.mockRestore()
  })

  test('should call submit with correct configurations', () => {
    const submitSpy = vi.spyOn(iframesModule, 'submit')
    new Tokenize(configurationsSDK).handle()

    expect(submitSpy).toHaveBeenCalledWith(configurationsSDK)
    submitSpy.mockRestore()
  })

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
