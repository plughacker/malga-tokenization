import {
  formElementsMock,
  formValuesMock,
  handleFormMock,
} from '../../../tests/mocks/elements-values-mocks'
import { Malga } from '../../common/malga/malga'
import { Tokenize } from '../tokenize'
import * as utils from '../../common/utils/form-values/form-values'

const MalgaConfigurations = {
  apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
  clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
}

vi.mock('../../common/malga/malga', async (importOriginal) => {
  const Malga =
    await importOriginal<typeof import('../../common/malga/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})

function Form() {
  const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
    handleFormMock()

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
}

describe('handle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  test('should be an asynchronous function and return a promise', async () => {
    Form()

    const malga = new Malga(MalgaConfigurations)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    expect(tokenizeObject.handle).toBeInstanceOf(Function)
    await expect(tokenizeObject.handle()).resolves.toBeDefined()
  })
  test('should be possible for a tokenId to exist when elements are passed correctly', async () => {
    Form()

    const malga = new Malga(MalgaConfigurations)

    const tokenizeObject = new Tokenize(malga, formElementsMock)
    const tokenId = await tokenizeObject.handle()

    expect(tokenId).toBeTruthy()
  })
  test('should be possible to return a tokenId equal to sandbox-token-id when configurations include sandbox equal to true', async () => {
    Form()

    const MalgaConfigurationsSandbox = {
      apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
      clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
      options: {
        sandbox: true,
      },
    }

    const malga = new Malga(MalgaConfigurationsSandbox)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    const tokenId = await tokenizeObject.handle()
    expect(tokenId).toMatchObject({ tokenId: 'sandbox-token-id' })
  })
  test('should be possible to return a tokenId equal to sandbox-token-id when configurations include production equal to true', async () => {
    Form()

    const MalgaConfigurationsProduction = {
      apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
      clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
    }

    const malga = new Malga(MalgaConfigurationsProduction)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    const tokenId = await tokenizeObject.handle()
    expect(tokenId).toMatchObject({ tokenId: 'production-token-id' })
  })
  test('should be possible to return error when elements are not passed correctly', async () => {
    Form()

    const malga = new Malga(MalgaConfigurations)

    const elementsMock = {
      form: 'jenjen',
      holderName: 'le',
      number: 'li',
      expirationDate: 'lo',
      cvv: 'lu',
    }
    const tokenizeObject = new Tokenize(malga, elementsMock)

    await expect(tokenizeObject.handle()).rejects.toThrowError(
      "Cannot read properties of null (reading 'value')",
    )
  })
  test('should be possible to return an error if the apiKey and clientId settings are empty', async () => {
    Form()

    const MalgaConfigurationsEmpty = {
      apiKey: '',
      clientId: '',
    }

    const malga = new Malga(MalgaConfigurationsEmpty)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    await expect(tokenizeObject.handle).rejects.toThrowError()
  })
  test('should be possible to perform the tokenization function and getFormValues with the respective elements correctly', async () => {
    Form()

    const malga = new Malga(MalgaConfigurations)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    const tokenizationSpy = vi.spyOn(malga, 'tokenization')

    const getFormValuesSpy = vi
      .spyOn(utils, 'getFormValues')
      .mockReturnValueOnce(formValuesMock)

    await tokenizeObject.handle()
    expect(tokenizationSpy).toHaveReturned()
    expect(getFormValuesSpy).toHaveReturned()

    expect(tokenizationSpy).toHaveBeenCalledWith(formValuesMock)
    expect(getFormValuesSpy).toHaveBeenCalledWith(formElementsMock)
  })
  test('should be possible that the getFormValues function is correctly returning the values assigned in the DOM', async () => {
    Form()

    const malga = new Malga(MalgaConfigurations)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    const getFormValuesSpy = vi.spyOn(utils, 'getFormValues')

    await tokenizeObject.handle()

    expect(getFormValuesSpy).toHaveReturnedWith({
      holderName: 'Taylor Swift',
      number: '5173000265860114',
      expirationDate: '05/08/2024',
      cvv: '114',
    })
  })
  test('should be possible to return an error if the form inputs do not have values assigned', async () => {
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

    const malga = new Malga(MalgaConfigurations)

    const tokenizeObject = new Tokenize(malga, formElementsMock)

    await expect(tokenizeObject.handle()).rejects.toThrowError()
  })
})
