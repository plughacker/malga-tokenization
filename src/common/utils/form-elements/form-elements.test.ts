import { MalgaFormElements } from 'src/common/interfaces'
import { getFormElements } from './form-elements'

const formElementsMock: MalgaFormElements = {
  form: 'data-malga-tokenization-feeorm',
  holderName: 'data-malga-tokenization-holder-name',
  number: 'data-malga-tokenization-number',
  expirationDate: 'data-malga-tokenization-expiration-date',
  cvv: 'data-malga-tokenization-cvv',
}

beforeEach(() => {
  const div = document.createElement('div')
  div.innerHTML = `
    <div>
      <form data-malga-tokenization-form>
        <input data-malga-tokenization-holder-name type="text" />
        <input data-malga-tokenization-number type="text" />
        <input data-malga-tokenization-expiration-date type="text" />
        <input data-malga-tokenization-cvv type="text" />
      </form>
    </div>
    
  `
  document.body.appendChild(div)
})

test('should be returned the elements correctly', () => {
  const formElements = getFormElements(formElementsMock)

  console.log(formElements)

  expect(formElements.form).toBeInTheDocument()
  expect(formElements.holderName).toBeInTheDocument()
  expect(formElements.cvv).toBeInTheDocument()
  expect(formElements.expirationDate).toBeInTheDocument()
  expect(formElements.number).toBeInTheDocument()
})
