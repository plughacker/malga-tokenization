import { URL_HOSTED_FIELD } from 'src/constants'
import { loaded } from './loaded'
import { configurationsSDK } from 'tests/mocks'

vi.mock('./create', () => ({
  create: vi.fn((field) => {
    const iframe = document.createElement('iframe')
    iframe.src = URL_HOSTED_FIELD
    iframe.name = field
    document.body.appendChild(iframe)

    return iframe
  }),
}))

describe('loaded', () => {
  test('should be possible to loaded the iframes', () => {
    loaded(configurationsSDK.options?.config)

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
