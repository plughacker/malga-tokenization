import { gettingOriginEvent } from 'src/utils'
import { loaded } from './loaded'
import { configurationsSDK } from 'tests/mocks'
import { URL_HOSTED_FIELD_PROD } from '../constants'
vi.mock('./create', () => ({
  create: vi.fn((field) => {
    const origin = gettingOriginEvent(false, false)

    const iframe = document.createElement('iframe')
    iframe.src = origin
    iframe.name = field
    document.body.appendChild(iframe)

    return iframe
  }),
}))

describe('loaded', () => {
  test('should be possible to loaded the iframes', () => {
    loaded(configurationsSDK.options)

    const iframes = document.querySelectorAll('iframe')

    expect(iframes).toHaveLength(4)

    iframes.forEach((iframe) => {
      expect(iframe).toHaveAttribute('src', URL_HOSTED_FIELD_PROD)
    })

    if (iframes) {
      const onloadEvent = new Event('load')

      iframes.forEach((iframe) => {
        iframe.dispatchEvent(onloadEvent)
      })
    }
  })
})
