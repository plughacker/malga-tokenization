import { submit } from './submit'
import { configurations } from 'tests/mocks/common-configurations'

describe('submit', () => {
  let iframeCardNumber: HTMLIFrameElement

  beforeAll(() => {
    iframeCardNumber = document.createElement('iframe')
    iframeCardNumber.name = 'card-number'
    document.body.appendChild(iframeCardNumber)

    Object.defineProperty(iframeCardNumber, 'contentWindow', {
      value: {
        postMessage: vi.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()

    if (document.body.contains(iframeCardNumber)) {
      document.body.removeChild(iframeCardNumber)
    }
  })

  test('should send a post message with authorization data', () => {
    submit(configurations)

    expect(iframeCardNumber).toBeInTheDocument()
    expect(iframeCardNumber.contentWindow?.postMessage).toHaveBeenCalledTimes(1)
    expect(iframeCardNumber.contentWindow?.postMessage).toHaveBeenCalledWith(
      {
        type: 'submit',
        data: {
          authorizationData: {
            clientId: 'test-client-id',
            apiKey: 'test-api-key',
          },
          sandbox: true,
        },
      },
      '*',
    )
  })
  test('should not send a post message if iframe does not exist', () => {
    iframeCardNumber.remove()

    submit(configurations)
    expect(iframeCardNumber.contentWindow?.postMessage).not.toHaveBeenCalled()
  })
})
