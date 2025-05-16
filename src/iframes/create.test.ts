import { CSSClasses } from 'src/enums'
import { create } from './create'
import { camelToKebabCase } from '../utils/parsedString'
import { configurationsSDK } from 'tests/mocks'
import { URL_HOSTED_FIELD_PROD } from 'src/constants'

describe('create', () => {
  function testCreatingIframe(field: string) {
    test(`should be possible to create an iframe with field ${field}`, () => {
      const type = camelToKebabCase(field)
      const parentNode = document.createElement('div')
      parentNode.id = type
      document.body.appendChild(parentNode)
      create((configurationsSDK.options?.config?.fields as any)[field])

      const iframe = document.querySelector(`iframe[name=${type}]`)

      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', URL_HOSTED_FIELD_PROD)
      expect(iframe).toHaveAttribute('name', type)
      expect(parentNode.classList.contains(CSSClasses.Default)).toBe(true)
      expect(parentNode.getAttribute('id')).toBe(type)
    })
  }

  const fields = [
    'cardNumber',
    'cardHolderName',
    'cardExpirationDate',
    'cardCvv',
  ]
  fields.forEach(testCreatingIframe)
})
