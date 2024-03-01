import { fireEvent, waitFor } from '@testing-library/dom'
import {
  formElementsMock,
  formValuesMock,
  handleFormMock,
  malgaConfigurations,
} from '../tests/mocks/malga-tests-mocks'
import { MalgaTokenization } from './tokenization'

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
function FormForTokenize(onSubmit: any) {
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
describe('init', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  test('should be possible to return the tokenId element', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    FormForInit(onSubmit)

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
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    const {
      form,
      holderNameInput,
      cvvInput,
      expirationDateInput,
      numberInput,
    } = handleFormMock()

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

    const malgaTokenizationObject = new MalgaTokenization(
      malgaConfigurations(false),
    )

    await waitFor(() => {
      expect(malgaTokenizationObject.init).rejects.toThrowError()
    })

    const formElement = document.querySelector('form')
    fireEvent.submit(formElement!)
  })
  test('should be possible to return an error if apiKey and clientId are passed empty', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

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

    const form = document.querySelector('form')
    fireEvent.submit(form!)
  })
})
describe('tokenize', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  test('should be possible to return a not falsy value equal to production-token-id', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    const malgaTokenizationObject = new MalgaTokenization(
      malgaConfigurations(false),
    )

    FormForTokenize(handleSubmit)

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    let tokenId: any

    async function handleSubmit(event: any) {
      event.preventDefault()

      tokenId = await malgaTokenizationObject.tokenize()
    }

    await waitFor(() => {
      expect(tokenId.tokenId).toBeTruthy()
      expect(tokenId.tokenId).toBe('production-token-id')
    })
  })
  test('should be possible to return an error if form elements do not have values assigned', async () => {
    window.HTMLFormElement.prototype.submit = () => {}

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
    form.onsubmit = handleSubmit
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

    async function handleSubmit(event: any) {
      event.preventDefault()

      await expect(malgaTokenizationObject.tokenize()).rejects.toThrowError()
    }
  })
  test('should be possible to return an error if apiKey and clientId are passed empty', () => {
    window.HTMLFormElement.prototype.submit = () => {}

    const malgaConfigurationsEmpty = {
      apiKey: '',
      clientId: '',
    }

    const malgaTokenizationObject = new MalgaTokenization(
      malgaConfigurationsEmpty,
    )

    FormForTokenize(handleSubmit)

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    async function handleSubmit(event: any) {
      event.preventDefault()

      await expect(malgaTokenizationObject.tokenize()).rejects.toThrowError()
    }
  })
})
