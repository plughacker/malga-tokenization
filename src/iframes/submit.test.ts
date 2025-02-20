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
      '*',
    )
  })

  test('should not send a post message if iframe does not exist', () => {
    handleRemoveIframe(iframeCardNumber)

    submit(configurationsSDK)
    expect(iframeCardNumber.contentWindow?.postMessage).not.toHaveBeenCalled()
  })
})
