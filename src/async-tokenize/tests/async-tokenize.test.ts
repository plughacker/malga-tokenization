import { Malga } from '../../common/malga/malga'
import { AsyncTokenize } from '../async-tokenize'
import {
  formElementsMock,
  formValuesMock,
  handleFormMock,
} from './mock/async-tokenize-mock'

const MalgaConfigurations = {
  apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
  clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
  options: {
    sandbox: true,
  },
}

vi.mock('../../common/malga/malga', async (importOriginal) => {
  const Malga =
    await importOriginal<typeof import('../../common/malga/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})

describe('handle', () => {
  test('askmsk', () => {
    const {
      form,
      holderNameInput,
      cvvInput,
      expirationDateInput,
      numberInput,
    } = handleFormMock()

    form.action = '/teste'
    form.method = 'POST'
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
    inputs[0].value = formValuesMock.holderName
    inputs[1].value = formValuesMock.number
    inputs[2].value = formValuesMock.expirationDate
    inputs[3].value = formValuesMock.cvv

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()
    console.log(inputs.length)
  })
})
