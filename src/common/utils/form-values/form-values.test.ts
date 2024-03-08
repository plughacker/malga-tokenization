import { formValuesMock } from 'tests/mocks/common-configurations'
import { getFormValues } from './form-values'
import { generateForm, generateFormEmptyValues } from 'tests/mocks/form-dom'

describe('getFormValues', () => {
  describe('form-values', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })
    test('should be the values of elements equals to sended', () => {
      generateForm()

      const formValue = getFormValues({
        form: 'data-malga-tokenization-form',
        holderName: 'data-malga-tokenization-holder-name',
        number: 'data-malga-tokenization-number',
        expirationDate: 'data-malga-tokenization-expiration-date',
        cvv: 'data-malga-tokenization-cvv',
      })

      expect(formValue.holderName).toEqual('Taylor Swift')
      expect(formValue.number).toEqual('5173000265860114')
      expect(formValue.expirationDate).toEqual('05/08/2024')
      expect(formValue.cvv).toEqual('114')
    })
    test('should be returned elements with empty values', () => {
      generateFormEmptyValues()

      const formValue = getFormValues({
        form: 'data-malga-tokenization-form',
        holderName: 'data-malga-tokenization-holder-name',
        number: 'data-malga-tokenization-number',
        expirationDate: 'data-malga-tokenization-expiration-date',
        cvv: 'data-malga-tokenization-cvv',
      })

      expect(formValue.holderName).toBe('')
      expect(formValue.number).toBe('')
      expect(formValue.expirationDate).toBe('')
      expect(formValue.cvv).toBe('')
    })
    test('should be possible to return error if the elements are not found', () => {
      generateForm()

      const inputs = document.querySelectorAll('input')
      inputs[0].value = formValuesMock.holderName
      inputs[1].value = formValuesMock.number
      inputs[2].value = formValuesMock.expirationDate
      inputs[3].value = formValuesMock.cvv

      expect(() =>
        getFormValues({
          form: 'data-malga-form',
          holderName: 'data-malga-holder-name',
          number: 'data-malga-number',
          expirationDate: 'data-malga-expiration-date',
          cvv: 'data-malga-cvv',
        }),
      ).toThrowError()
    })
  })
})
