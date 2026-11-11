import { Event } from 'src/enums'
import { configurationsSDK } from 'tests/mocks'
import { MalgaTokenization } from './tokenization'
import { clearContainersInUse } from './utils'

// No mocks: real instances in jsdom, to cover what can change on the page while
// the apiKey function is still running.

const STORAGE_KEY = 'malga-card-card-number'
const COLLECTED_CARD = {
  cardNumber: 'encrypted-number',
  cardHolderName: 'encrypted-holder',
  cardExpirationDate: 'encrypted-expiry',
  cardCvv: 'encrypted-cvv',
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function mountContainers() {
  for (const field of Object.values(configurationsSDK.options.config.fields)) {
    const element = document.createElement('div')
    element.id = field.container
    document.body.appendChild(element)
  }
}

function cardNumberWindow() {
  const [iframe] = document.getElementsByName('card-number')
  return (iframe as HTMLIFrameElement).contentWindow!
}

function pendingApiKey() {
  let resolveApiKey!: (apiKey: string) => void
  const apiKey = () =>
    new Promise<string>((resolve) => (resolveApiKey = resolve))
  return { apiKey, resolve: (key: string) => resolveApiKey(key) }
}

const submittedMessages = (postMessage: ReturnType<typeof vi.spyOn>) =>
  postMessage.mock.calls.filter(
    ([message]: any[]) => message.eventType === Event.Submit,
  )

describe('apiKey as a function, with real instances', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    clearContainersInUse()
    mountContainers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    sessionStorage.clear()
    clearContainersInUse()
  })

  test('should not send the card of a new instance created on the same containers while the key was fetched', async () => {
    const pending = pendingApiKey()
    const oldInstance = new MalgaTokenization({
      ...configurationsSDK,
      clientId: 'old-client',
      apiKey: pending.apiKey,
    })
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(COLLECTED_CARD))

    const oldTokenize = oldInstance.tokenize()
    oldInstance.destroy()

    const newInstance = new MalgaTokenization({
      ...configurationsSDK,
      clientId: 'new-client',
      apiKey: 'new-key',
    })
    const postMessage = vi.spyOn(cardNumberWindow(), 'postMessage')
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...COLLECTED_CARD, cardNumber: 'new-card' }),
    )

    pending.resolve('old-key')

    await expect(oldTokenize).rejects.toThrow(
      'the instance was destroyed or its card fields were replaced',
    )
    expect(submittedMessages(postMessage)).toHaveLength(0)

    newInstance.destroy()
  })

  test('should not send the card when a field is cleared while the key is fetched', async () => {
    const pending = pendingApiKey()
    const instance = new MalgaTokenization({
      ...configurationsSDK,
      apiKey: pending.apiKey,
    })
    const postMessage = vi.spyOn(cardNumberWindow(), 'postMessage')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(COLLECTED_CARD))

    const tokenize = instance.tokenize()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...COLLECTED_CARD, cardCvv: '' }),
    )
    pending.resolve('sub-key')
    await flushPromises()

    const response = await tokenize
    expect(response.error).toEqual(
      expect.objectContaining({
        type: 'invalid_request_error',
        details: ['cardCvv'],
      }),
    )
    expect(submittedMessages(postMessage)).toHaveLength(0)

    instance.destroy()
  })
})
