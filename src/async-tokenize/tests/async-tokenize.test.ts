import { fireEvent, waitFor } from '@testing-library/dom'
import {
  formElementsMock,
  formValuesMock,
  handleFormMock,
} from './mock/async-tokenize-mock'
import { Malga } from '../../common/malga/malga'
import { AsyncTokenize } from '../async-tokenize'
import * as utilsValues from '../../common/utils/form-values/form-values'
import * as utilsElements from '../../common/utils/form-elements/form-elements'

const MalgaConfigurations = {
  apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
  clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
  options: {
    sandbox: true,
  },
}
const onSubmit = vi.fn()

vi.mock('../../common/malga/malga', async (importOriginal) => {
  const Malga =
    await importOriginal<typeof import('../../common/malga/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})

function Form(props: any) {
  const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
    handleFormMock()

  form.setAttribute(formElementsMock.form, '')
  form.onsubmit = props.onSubmit
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

describe('handle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  test('should be possible to find a tokenId element in the DOM and consequently contained in the form element', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    const cvvInput = document.querySelector(
      'input[data-malga-tokenization-cvv]',
    )
    expect(form).toContain(cvvInput)

    await waitFor(() => {
      const tokenIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tokenId"]',
      )
      expect(tokenIdInput).toBeInTheDocument()
      expect(form).toContain(tokenIdInput)
      expect(tokenIdInput).toBeTruthy()
    })
  })
  test('should be possible to return a value in tokenIdElement and if the settings include the sandbox: true option, the value must be sandox-token-id ', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const MalgaConfigurationsSandBox = {
      apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
      clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
      options: {
        sandbox: true,
      },
    }

    const malga = new Malga(MalgaConfigurationsSandBox)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const tokenIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tokenId"]',
      )
      expect(tokenIdInput?.value).toBe('sandbox-token-id')
    })
  })
  test('should be possible to return a value in tokenIdElement and if the settings not include the sandbox: true option, the value must be production-token-id', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const MalgaConfigurationsProduction = {
      apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
      clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
    }

    const malga = new Malga(MalgaConfigurationsProduction)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const tokenIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tokenId"]',
      )
      console.log('tokenId: ', tokenIdInput)
      expect(tokenIdInput?.value).toBe('production-token-id')
    })
  })
  test('should be possible to remove the elements and thus there is only 1 after the creation of the tokenIdElement and 4 before its creation', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    const inputs = document.querySelectorAll('input')
    expect(inputs.length).toBe(4)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const inputs = document.querySelectorAll('input')
      expect(inputs.length).toBe(1)
    })
  })
  test('should be possible for handle to call the getFormElements, getFormValues, Tokenization, removeFormElements and createFormElements functions passing the elements correctly', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    const getFormElementsSpy = vi.spyOn(utilsElements, 'getFormElements')
    const getFormValuesSpy = vi.spyOn(utilsValues, 'getFormValues')
    const tokenizationSpy = vi.spyOn(malga, 'tokenization')
    const removeFormElementsSpy = vi.spyOn(utilsElements, 'removeFormElements')
    const createFormElementSpy = vi.spyOn(utilsElements, 'createFormElement')

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const tokenIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tokenId"]',
      )
      expect(getFormElementsSpy).toHaveBeenCalledWith(formElementsMock)
      expect(getFormValuesSpy).toHaveBeenCalledWith(formElementsMock)
      expect(tokenizationSpy).toHaveBeenCalledWith(formValuesMock)
      expect(removeFormElementsSpy).toHaveBeenCalledWith(formElementsMock)
      expect(createFormElementSpy).toHaveBeenCalledWith(
        tokenIdInput?.name,
        tokenIdInput?.value,
      )
    })
  })
  test('should be possible to check if the form was submitted and event.preventDefault was called afterwards', async () => {
    const submit = vi.fn()
    window.HTMLFormElement.prototype.submit = submit
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })
    const event = new Event('submit')
    const preventDefault = vi.spyOn(event, 'preventDefault')

    Form(onSubmit)

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent(form!, event)

    await waitFor(() => {
      expect(form?.submit).toHaveBeenCalled()
      expect(preventDefault).toBeCalled()
    })
  })
  test('should be possible to return an error if empty apiKey and clientId are sent to the Malga constructor', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const MalgaConfigurationsEmpty = {
      apiKey: '',
      clientId: '',
    }

    const malga = new Malga(MalgaConfigurationsEmpty)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    expect(asyncTokenizeObject.handle).toThrowError()

    const form = document.querySelector('form')
    fireEvent.submit(form!)
  })
  test('should be possible to throw an error when the elements passed are incompatible with those in the DOM', async () => {
    window.HTMLFormElement.prototype.submit = () => {}
    onSubmit.mockImplementation((event) => {
      event.preventDefault()
    })

    Form(onSubmit)

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, {
      form: 'data-form',
      holderName: 'data-holder-name',
      number: 'data-number',
      expirationDate: 'data-expiration-date',
      cvv: 'data-cvv',
    })

    expect(asyncTokenizeObject.handle).toThrowError(
      "Cannot read properties of undefined (reading 'elements')",
    )

    const form = document.querySelector('form')
    fireEvent.submit(form!)
  })
  test('asjnj', async () => {
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

    const malga = new Malga(MalgaConfigurations)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    expect(asyncTokenizeObject.handle).toThrowError()

    const form2 = document.querySelector('form')
    fireEvent.submit(form2!)
  })
})
