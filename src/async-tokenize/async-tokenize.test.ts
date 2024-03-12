import { fireEvent, waitFor } from '@testing-library/dom'

import { AsyncTokenize } from './async-tokenize'
import {
  configureFormSubmissionMock,
  formElementsMock,
  malgaConfigurations,
} from 'tests/mocks/common-configurations'
import { generateForm } from 'tests/mocks/form-dom'
import { Malga } from 'src/common/malga'

const onSubmit = vi.fn()

vi.mock('src/common/malga', async (importOriginal) => {
  const Malga = await importOriginal<typeof import('src/common/malga')>()
  return {
    ...Malga,
    tokenization: vi.fn(),
  }
})

describe('async-tokenize', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  test('should be possible to find a tokenId element in the DOM and consequently contained in the form element', async () => {
    configureFormSubmissionMock()
    generateForm(onSubmit)

    const malga = new Malga(malgaConfigurations(false))

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

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
  test('should be return correct tokenId in sandbox environment ', async () => {
    configureFormSubmissionMock()

    generateForm(onSubmit)

    const malga = new Malga(malgaConfigurations(true))

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
  test('should be return correct tokenId in production environment', async () => {
    configureFormSubmissionMock()

    generateForm(onSubmit)

    const malgaConfigurationsProduction = {
      apiKey: '17a64c8f-a387-4682-bdd8-d280493715e0',
      clientId: 'd1d2b51a-0446-432a-b055-034518c2660e',
    }

    const malga = new Malga(malgaConfigurationsProduction)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    asyncTokenizeObject.handle()

    const form = document.querySelector('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      const tokenIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tokenId"]',
      )
      expect(tokenIdInput?.value).toBe('production-token-id')
    })
  })
  test('should be possible to remove the elements and thus there is only 1 after the creation of the tokenIdElement and 4 before its creation', async () => {
    configureFormSubmissionMock()

    generateForm(onSubmit)

    const malga = new Malga(malgaConfigurations(false))

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

  test('should be possible to return an error if empty apiKey and clientId are sent to the Malga constructor', async () => {
    configureFormSubmissionMock()

    generateForm(onSubmit)

    const malgaConfigurationsEmpty = {
      apiKey: '',
      clientId: '',
    }

    const malga = new Malga(malgaConfigurationsEmpty)

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    expect(asyncTokenizeObject.handle).toThrowError(
      "Cannot read properties of undefined (reading 'elements')",
    )
  })
  test('should be possible to throw an error when the elements passed are incompatible with those in the DOM', async () => {
    configureFormSubmissionMock()

    generateForm(onSubmit)

    const malga = new Malga(malgaConfigurations(false))

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
  })
  test('should be possible to return an error if the form inputs do not have values assigned', async () => {
    configureFormSubmissionMock()
    generateForm()

    const malga = new Malga(malgaConfigurations(false))

    const asyncTokenizeObject = new AsyncTokenize(malga, formElementsMock)

    expect(asyncTokenizeObject.handle).toThrowError()
  })
})
