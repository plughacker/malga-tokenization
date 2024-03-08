import { fireEvent, waitFor } from '@testing-library/dom'
import {
  configureFormSubmissionMock,
  formElementsMock,
  formValuesMock,
  handleFormMock,
  malgaConfigurations,
} from '../tests/mocks/common-configurations'
import { MalgaTokenization } from './tokenization'
import { generateForm, generateFormEmptyValues } from 'tests/mocks/form-dom'

vi.mock('./common/malga', async (importOriginal) => {
  const Malga = await importOriginal<typeof import('./common/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})
const onSubmit = vi.fn()

function FormForInit(onSubmit: any) {
  const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
    handleFormMock()

  form.setAttribute(formElementsMock.form, '')
  form.onsubmit = onSubmit
  form.id = 'form'
  form.method = 'POST'
  form.action = '/test'

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
function FormForTokenize() {
  const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
    handleFormMock()

  form.setAttribute(formElementsMock.form, '')

  form.id = 'form'
  form.method = 'POST'
  form.action = '/test'

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
describe('MalgaTokenization', () => {
  describe('init', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })
    test('should be possible to return the tokenId element', async () => {
      configureFormSubmissionMock()

      generateForm(onSubmit)

      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurations(false),
      )

      malgaTokenizationObject.init()

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await waitFor(() => {
        const tokenIdInput = document.querySelector<HTMLInputElement>(
          'input[name="tokenId"]',
        )
        expect(tokenIdInput).toBeInTheDocument()
        expect(form).toContain(tokenIdInput)
        expect(tokenIdInput).toBeTruthy()
      })
    })
    test('should be possible to return an error if form elements do not have values assigned', async () => {
      configureFormSubmissionMock()

      generateFormEmptyValues(onSubmit)

      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurations(false),
      )

      await waitFor(() => {
        expect(malgaTokenizationObject.init).rejects.toThrowError()
      })
    })
    test('should be possible to return an error if apiKey and clientId are passed empty', async () => {
      configureFormSubmissionMock()

      FormForInit(onSubmit)

      const malgaConfigurationsEmpty = {
        apiKey: '',
        clientId: '',
      }

      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurationsEmpty,
      )

      await waitFor(() => {
        expect(malgaTokenizationObject.init).rejects.toThrowError()
      })
    })
  })
  describe('tokenize', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })
    test('should be possible to return a not falsy value equal to production-token-id', async () => {
      configureFormSubmissionMock()
      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurations(false),
      )
      FormForTokenize()
      const form = document.querySelector('form')
      fireEvent.submit(form!)
      const { tokenId } = await malgaTokenizationObject.tokenize()
      await waitFor(() => {
        expect(tokenId).toBe('production-token-id')
      })
    })
    test('should be possible to return an error if form elements do not have values assigned', async () => {
      configureFormSubmissionMock()
      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurations(false),
      )

      const {
        form,
        holderNameInput,
        cvvInput,
        expirationDateInput,
        numberInput,
      } = handleFormMock()

      form.setAttribute(formElementsMock.form, '')
      form.id = 'form'
      form.method = 'POST'
      form.action = '/test'

      holderNameInput.setAttribute(formElementsMock.holderName, '')
      numberInput.setAttribute(formElementsMock.number, '')
      cvvInput.setAttribute(formElementsMock.cvv, '')
      expirationDateInput.setAttribute(formElementsMock.expirationDate, '')

      document.body.appendChild(form)
      form.appendChild(holderNameInput)
      form.appendChild(numberInput)
      form.appendChild(expirationDateInput)
      form.appendChild(cvvInput)

      const form2 = document.querySelector('form')
      fireEvent.submit(form2!)

      await expect(malgaTokenizationObject.tokenize()).rejects.toThrowError()
    })
    test('should be possible to return an error if apiKey and clientId are passed empty', async () => {
      configureFormSubmissionMock()

      const malgaConfigurationsEmpty = {
        apiKey: '',
        clientId: '',
      }

      const malgaTokenizationObject = new MalgaTokenization(
        malgaConfigurationsEmpty,
      )

      FormForTokenize()

      const form = document.querySelector('form')
      fireEvent.submit(form!)

      await expect(malgaTokenizationObject.tokenize()).rejects.toThrowError()
    })
  })
})
