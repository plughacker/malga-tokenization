import { getFormElements } from './form-elements'
import {
  formElementsMock,
  handleFormMock,
  setAttributeFormElements,
} from '../../../../tests/mocks/formElements-mock'
describe('getFormElements', () => {
  test('should be returned the elements correctly', () => {
    const {
      form,
      holderNameInput,
      cvvInput,
      expirationDateInput,
      numberInput,
    } = handleFormMock()

    form.setAttribute(formElementsMock.form, '')
    holderNameInput.setAttribute(formElementsMock.holderName, '')
    numberInput.setAttribute(formElementsMock.number, '')
    cvvInput.setAttribute(formElementsMock.cvv, '')
    expirationDateInput.setAttribute(formElementsMock.expirationDate, '')

    document.body.appendChild(form)
    form.appendChild(holderNameInput)
    form.appendChild(numberInput)
    form.appendChild(expirationDateInput)
    form.appendChild(cvvInput)

    const formElements = getFormElements({
      form: 'data-malga-tokenization-form',
      holderName: 'data-malga-tokenization-holder-name',
      number: 'data-malga-tokenization-number',
      expirationDate: 'data-malga-tokenization-expiration-date',
      cvv: 'data-malga-tokenization-cvv',
    })

    expect(formElements.form).toBe(form)
    expect(formElements.holderName).toBe(holderNameInput)
    expect(formElements.number).toBe(numberInput)
    expect(formElements.expirationDate).toBe(expirationDateInput)
    expect(formElements.cvv).toBe(cvvInput)
  })

  test("Should be returned null when elements aren't finded", () => {
    setAttributeFormElements()

    const formElements = getFormElements({
      form: 'data-malga-tokenization-form',
      holderName: 'data-malga-tokenization-holder-name',
      number: 'data-malga-tokenization-number',
      expirationDate: 'data-malga-tokenization-expiration-date',
      cvv: 'data-malga-tokenization-cvv',
    })

    expect(formElements.form).toBeInTheDocument()
    expect(formElements.holderName).toBeInTheDocument()
    expect(formElements.cvv).toBeInTheDocument()
    expect(formElements.expirationDate).toBeInTheDocument()
    expect(formElements.number).toBeInTheDocument()
  })

  test("Should be returned null when elements aren't finded", () => {
    setAttributeFormElements()

    const formElements = getFormElements({
      form: 'data-malga-form',
      holderName: 'data-malga-name',
      number: 'data-malga-number',
      expirationDate: 'data-malga-expiration-date',
      cvv: 'data-malga-cvv',
    })
    expect(formElements.form).toBeNull()
    expect(formElements.holderName).toBeNull()
    expect(formElements.number).toBeNull()
    expect(formElements.expirationDate).toBeNull()
    expect(formElements.cvv).toBeNull()
  })
})
