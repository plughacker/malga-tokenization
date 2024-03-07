import {
  formElementsMock,
  handleFormMock,
  malgaConfigurations,
} from 'tests/mocks/common-configurations'
import { generateForm } from 'tests/mocks/form-dom'
import { Malga } from 'src/common/malga'
import { Tokenize } from './tokenize'

vi.mock('src/common/malga', async (importOriginal) => {
  const Malga = await importOriginal<typeof import('src/common/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})

describe('Tokenize', () => {
  describe('handle', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    test('should be possible for a tokenId to exist when elements are passed correctly', async () => {
      generateForm()

      const malga = new Malga(malgaConfigurations(false))

      const tokenizeObject = new Tokenize(malga, formElementsMock)
      const tokenId = await tokenizeObject.handle()

      expect(tokenId).toBeTruthy()
    })
    test('should be possible to return a tokenId equal to sandbox-token-id when configurations include sandbox equal to true', async () => {
      generateForm()

      const malga = new Malga(malgaConfigurations(true))

      const tokenizeObject = new Tokenize(malga, formElementsMock)

      const tokenId = await tokenizeObject.handle()
      expect(tokenId).toMatchObject({ tokenId: 'sandbox-token-id' })
    })
    test('should be possible to return a tokenId equal to sandbox-token-id when configurations include production equal to true', async () => {
      generateForm()

      const malga = new Malga(malgaConfigurations(false))

      const tokenizeObject = new Tokenize(malga, formElementsMock)

      const tokenId = await tokenizeObject.handle()
      expect(tokenId).toMatchObject({ tokenId: 'production-token-id' })
    })
    test('should be possible to return error when elements are not passed correctly', async () => {
      generateForm()

      const malga = new Malga(malgaConfigurations(false))

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
      generateForm()

      const malgaConfigurationsEmpty = {
        apiKey: '',
        clientId: '',
      }

      const malga = new Malga(malgaConfigurationsEmpty)

      const tokenizeObject = new Tokenize(malga, formElementsMock)

      await expect(tokenizeObject.handle).rejects.toThrowError(
        "Cannot read properties of undefined (reading 'elements')",
      )
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

      const malga = new Malga(malgaConfigurations(false))

      const tokenizeObject = new Tokenize(malga, formElementsMock)

      await expect(tokenizeObject.handle()).rejects.toThrowError()
    })
  })
})
