import { submit } from './submit'
import {
  configurationsSDK,
  configurationWithSubmitData,
  handleRemoveIframe,
  handleSetupIframeInDOM,
} from 'tests/mocks'

describe('submit', () => {
  let iframeCardNumber: HTMLIFrameElement

  beforeAll(() => {
    iframeCardNumber = handleSetupIframeInDOM('card-number', {
      postMessage: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    handleRemoveIframe(iframeCardNumber)
  })

  test('should send a post message with authorization data', () => {
    submit(configurationsSDK)

    expect(iframeCardNumber).toBeInTheDocument()
    expect(iframeCardNumber.contentWindow?.postMessage).toHaveBeenCalledTimes(1)
    expect(iframeCardNumber.contentWindow?.postMessage).toHaveBeenCalledWith(
      configurationWithSubmitData,
      'https://hosted-fields.malga.io',
    )
  })

  test('should find the card number iframe whatever the container name', () => {
    const container = '1-card.number'
    const iframe = handleSetupIframeInDOM(container, { postMessage: vi.fn() })
    const fields = {
      ...configurationsSDK.options.config.fields,
      cardNumber: { container },
    }
    const configurations = {
      ...configurationsSDK,
      options: {
        ...configurationsSDK.options,
        config: { ...configurationsSDK.options.config, fields },
      },
    }

    expect(() => submit(configurations)).not.toThrow()
    expect(iframe.contentWindow?.postMessage).toHaveBeenCalledTimes(1)

    handleRemoveIframe(iframe)
  })

  test('should not send a post message if iframe does not exist', () => {
    handleRemoveIframe(iframeCardNumber)

    submit(configurationsSDK)
    expect(iframeCardNumber.contentWindow?.postMessage).not.toHaveBeenCalled()
  })
})
