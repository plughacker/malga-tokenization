import { MalgaFormElements } from '../../src/common/interfaces/form'

export const formElementsMock: MalgaFormElements = {
  form: 'data-malga-tokenization-form',
  holderName: 'data-malga-tokenization-holder-name',
  number: 'data-malga-tokenization-number',
  expirationDate: 'data-malga-tokenization-expiration-date',
  cvv: 'data-malga-tokenization-cvv',
}

export const formValuesMock = {
  holderName: 'Taylor Swift',
  number: '5173 0002 6586 0114',
  expirationDate: '05/08/2024',
  cvv: '114',
}

export const handleFormMock = () => {
  return {
    form: document.createElement('form'),
    holderNameInput: document.createElement('input'),
    cvvInput: document.createElement('input'),
    expirationDateInput: document.createElement('input'),
    numberInput: document.createElement('input'),
  }
}
export const appendInTheDocument = ({
  form,
  holderNameInput,
  numberInput,
  expirationDateInput,
  cvvInput,
}: any) => {
  document.body.appendChild(form)
  form.appendChild(holderNameInput)
  form.appendChild(numberInput)
  form.appendChild(expirationDateInput)
  form.appendChild(cvvInput)
}

export const appendValueOnInputs = () => {
  setAttributeFormElements()

  const inputs = document.querySelectorAll('input')
  inputs[0].value = 'Milena Rios'
  inputs[1].value = '5173 0002 6586 0114'
  inputs[2].value = '05/08/2024'
  inputs[3].value = '114'
}
export const setAttributeFormElements = () => {
  const { form, holderNameInput, numberInput, expirationDateInput, cvvInput } =
    handleFormMock()

  form.setAttribute(formElementsMock.form, ''),
    holderNameInput.setAttribute(formElementsMock.holderName, ''),
    numberInput.setAttribute(formElementsMock.number, ''),
    cvvInput.setAttribute(formElementsMock.cvv, ''),
    expirationDateInput.setAttribute(formElementsMock.expirationDate, '')

  appendInTheDocument({
    form,
    holderNameInput,
    numberInput,
    expirationDateInput,
    cvvInput,
  })
}

export function teste(form: any) {
  form.form.setAttribute(formElementsMock, '')
  form.holderNameInput.setAttribute(formElementsMock.holderName, ''),
    form.numberInput.setAttribute(formElementsMock.number, ''),
    form.cvvInput.setAttribute(formElementsMock.cvv, ''),
    form.expirationDateInput.setAttribute(formElementsMock.expirationDate, '')
}
