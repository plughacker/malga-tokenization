import { MalgaFormElements } from 'src/common/interfaces'

export const formValuesMock = {
  holderName: 'Taylor Swift',
  number: '5173000265860114',
  expirationDate: '05/08/2024',
  cvv: '114',
}

export const handleFormMock = () => {
  return {
    form: document.createElement('form'),
    holderNameInput: document.createElement('input'),
    numberInput: document.createElement('input'),
    expirationDateInput: document.createElement('input'),
    cvvInput: document.createElement('input'),
  }
}

export const formElementsMock: MalgaFormElements = {
  form: 'data-malga-tokenization-form',
  holderName: 'data-malga-tokenization-holder-name',
  number: 'data-malga-tokenization-number',
  expirationDate: 'data-malga-tokenization-expiration-date',
  cvv: 'data-malga-tokenization-cvv',
}

export const formElementsMock2: MalgaFormElements = {
  form: 'data-tokenization-form',
  holderName: 'data-tokenization-holder-name',
  number: 'data-tokenization-number',
  expirationDate: 'data-tokenization-expiration-date',
  cvv: 'data-tokenization-cvv',
}
