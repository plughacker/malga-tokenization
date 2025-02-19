import { URL_HOSTED_FIELD } from 'src/constants'
import { loaded } from './loaded'
import { camelToKebabCase } from 'src/utils'

const config = {
  fields: {
    cardNumber: {
      container: '#card-number',
      type: 'text',
    },
    cardHolderName: {
      container: '#card-holder-name',
      type: 'text',
    },
    cardExpirationDate: {
      container: '#card-expiration-date',
      type: 'text',
    },
    cardCvv: {
      container: '#card-cvv',
      type: 'text',
    },
  },
}

vi.mock('./create', () => ({
  create: vi.fn((field) => {
    const iframe = document.createElement('iframe')
    iframe.src = URL_HOSTED_FIELD
    iframe.name = camelToKebabCase(field)
    document.body.appendChild(iframe)

    return iframe
  }),
}))

describe('loaded', () => {
  test('should be possible to loaded the iframes', () => {
    loaded(config)
    const iframes = document.querySelectorAll('iframe')
    expect(iframes).toHaveLength(4)

    iframes.forEach((iframe) => {
      expect(iframe).toHaveAttribute('src', URL_HOSTED_FIELD)
    })

    if (iframes) {
      const onloadEvent = new Event('load')

      iframes.forEach((iframe) => {
        iframe.dispatchEvent(onloadEvent)
      })
    }
  })
})
