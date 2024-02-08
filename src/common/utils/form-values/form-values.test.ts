import {
  appendValueOnInputs,
  formElementsMock,
  handleFormMock,
  setAttributeFormElements,
} from '../../../../tests/mocks/formElements-mock'
import { getFormValues } from './form-values'

describe('getFormValues', () => {
  test('should be the values of elements equals to sended', () => {
    setAttributeFormElements()
    appendValueOnInputs()
    const formValue = getFormValues(formElementsMock)

    expect(formValue.holderName).toEqual('Milena Rios')
    expect(formValue.number).toEqual('5173 0002 6586 0114')
    expect(formValue.expirationDate).toEqual('05/08/2024')
    expect(formValue.cvv).toEqual('114')
  })
  test("should be returned undefined when elements aren't finded", () => {
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

    const inputs = document.querySelectorAll('input')
    inputs[0].value = ''
    inputs[1].value = ''
    inputs[2].value = ''
    inputs[3].value = ''

    const formValue = getFormValues(formElementsMock)

    expect(formValue.holderName).toBe('')
    expect(formValue.number).toBe('')
    expect(formValue.expirationDate).toBe('')
    expect(formValue.cvv).toBe('')
  })
})
