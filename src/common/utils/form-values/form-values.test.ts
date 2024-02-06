import { MalgaFormElements } from 'src/common/interfaces'
import { getFormValues } from './form-values'

const formElementsMock: MalgaFormElements = {
  form: 'data-malga-tokenization-form',
  holderName: 'data-malga-tokenization-holder-name',
  number: 'data-malga-tokenization-number',
  expirationDate: 'data-malga-tokenization-expiration-date',
  cvv: 'data-malga-tokenization-cvv',
}

beforeEach(() => {
  const div = document.createElement('div')
  div.innerHTML = `
    <form data-malga-tokenization-form>
        <input data-malga-tokenization-holder-name type="text" />
        <input data-malga-tokenization-number type="text" />
        <input data-malga-tokenization-expiration-date type="text" />
        <input data-malga-tokenization-cvv type="text" />
    </form>
    `
  document.body.appendChild(div)

  const inputs = div.querySelectorAll('input')
  inputs[0].setAttribute('value', 'Milena Rios')
  inputs[1].setAttribute('value', '5173 0002 6586 0114')
  inputs[2].setAttribute('value', '05/08/2024')
  inputs[3].setAttribute('value', '114')
})

describe('getFormValues', () => {
  test('should be the values of elements equals to sended', () => {
    const formValue = getFormValues(formElementsMock)

    expect(formValue.holderName).toEqual('Milena Rios')
    expect(formValue.number).toEqual('5173 0002 6586 0114')
    expect(formValue.expirationDate).toEqual('05/08/2024')
    expect(formValue.cvv).toEqual('114')
  })
})
