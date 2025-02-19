import type { MalgaConfigurations } from 'src/interfaces'
import { submit } from './submit'

const configurations: MalgaConfigurations = {
  clientId: 'test-client-id',
  apiKey: 'test-api-key',
  options: {
    config: {
      fields: {
        cardNumber: {
          container: '#card-number',
        },
        cardHolderName: {
          container: '#card-holder-name',
        },
        cardExpirationDate: {
          container: '#card-expiration-date',
        },
        cardCvv: {
          container: '#card-cvv',
        },
      },
    },
    sandbox: true,
  },
}

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
