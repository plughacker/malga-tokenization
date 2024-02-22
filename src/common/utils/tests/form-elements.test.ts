import {
  createFormElement,
  getFormElements,
  removeFormElements,
} from '../form-elements/form-elements'
import { formElementsMock, handleFormMock } from './mocks/formElements-mock'
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

  test('should be possible to find the elements in the dom', () => {
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

    expect(formElements.form).toBeInTheDocument()
    expect(formElements.holderName).toBeInTheDocument()
    expect(formElements.cvv).toBeInTheDocument()
    expect(formElements.expirationDate).toBeInTheDocument()
    expect(formElements.number).toBeInTheDocument()
  })

  test("Should be returned null when elements aren't finded", () => {
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
      form: 'data-malga-form',
      holderName: 'data-malga-holder-name',
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

describe('removeFormElements', () => {
  test('should be possible to return null when trying to find the elements in the dom after calling the function', () => {
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

    removeFormElements({
      form: 'data-malga-tokenization-form',
      holderName: 'data-malga-tokenization-holder-name',
      number: 'data-malga-tokenization-number',
      expirationDate: 'data-malga-tokenization-expiration-date',
      cvv: 'data-malga-tokenization-cvv',
    })

    expect(document.querySelector('holderName')).toBeNull()
    expect(document.querySelector('number')).toBeNull()
    expect(document.querySelector('expirationDate')).toBeNull()
    expect(document.querySelector('cvv')).toBeNull()
  })
  test('should be returned the elements in the DOM, when the function are called with selectores wrong, since the elements could not be removed', () => {
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

    removeFormElements({
      form: 'data-malga-form',
      holderName: 'data-malga-holder-name',
      number: 'data-malga-number',
      expirationDate: 'data-malga-expiration-date',
      cvv: 'data-malga-cvv',
    })
    const formElements = getFormElements({
      form: 'data-malga-tokenization-form',
      holderName: 'data-malga-tokenization-holder-name',
      number: 'data-malga-tokenization-number',
      expirationDate: 'data-malga-tokenization-expiration-date',
      cvv: 'data-malga-tokenization-cvv',
    })
    expect(formElements.form).toBeInTheDocument()
    expect(formElements.holderName).toBeInTheDocument()
    expect(formElements.number).toBeInTheDocument()
    expect(formElements.expirationDate).toBeInTheDocument()
    expect(formElements.cvv).toBeInTheDocument()
  })
})

describe('createFormElements', () => {
  test('should be possible to return a field with attributes of name, type and value which must be the passed tokenId', () => {
    const tokenId = '54595fec-87db-44f8-996a-2f4d6bf270b9'
    const tokenIdElement = createFormElement('tokenId', tokenId)

    expect(tokenIdElement).toHaveAttribute('name', 'tokenId')
    expect(tokenIdElement).toHaveValue(tokenId)
    expect(tokenIdElement).toHaveAttribute('type', 'hidden')
  })

  test('should be possible for the field field to be the same as the one mounted in the dom', () => {
    const tokenId = '54595fec-87db-44f8-996a-2f4d6bf270b9'

    const tokenIdElement = createFormElement('tokenId', tokenId)

    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = 'tokenId'
    field.value = '54595fec-87db-44f8-996a-2f4d6bf270b9'

    expect(tokenIdElement).toEqual(field)
  })
  test('should be possible to insert the element in the body in the dom', () => {
    const tokenId = '54595fec-87db-44f8-996a-2f4d6bf270b9'
    const tokenIdElement = createFormElement('tokenId', tokenId)

    document.body.appendChild(tokenIdElement)

    expect(tokenIdElement).toBeInTheDocument()
  })
})