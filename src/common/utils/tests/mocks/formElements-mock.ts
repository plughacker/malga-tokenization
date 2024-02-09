import { MalgaFormElements } from '../../../interfaces/form'

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
