import { MalgaTokenization } from './tokenization'
import { Events } from './events'
import { Tokenize } from './tokenize'
import { loaded, listener } from './iframes'
import { configurationsSDK } from 'tests/mocks'
import { clearContainersInUse } from './utils'

vi.mock('./tokenize')
vi.mock('./iframes')
vi.mock('./events', () => {
  const MockEvents = vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    clear: vi.fn(),
  }))
  return { Events: MockEvents }
})

const getEventsOf = (index: number) =>
  vi.mocked(Events).mock.results[index].value as {
    on: ReturnType<typeof vi.fn>
  }

// A mesma configuração com outros containers: um segundo cartão na página.
const withContainerSuffix = (suffix: string) => ({
  ...configurationsSDK,
  options: {
    ...configurationsSDK.options,
    config: {
      ...configurationsSDK.options.config,
      fields: Object.fromEntries(
        Object.entries(configurationsSDK.options.config.fields).map(
          ([fieldKey, field]) => [
            fieldKey,
            { ...field, container: `${field.container}${suffix}` },
          ],
        ),
      ) as typeof configurationsSDK.options.config.fields,
    },
  },
})

describe('tokenization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearContainersInUse()
  })

  test('should create a new MalgaTokenization with configurations', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)

    expect(malgaTokenization).toBeDefined()
    expect(loaded).toHaveBeenCalled()
    expect(listener).toHaveBeenCalled()
  })

  test('should show an error if API key is missing', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    new MalgaTokenization({ ...configurationsSDK, apiKey: '' })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
    )
  })

  test('should show an error if client ID is missing', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    new MalgaTokenization({ ...configurationsSDK, clientId: '' })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Missing API key. Pass it to the constructor `new MalgaTokenization({ apiKey: "YOUR_API_KEY", clientId: "YOUR_CLIENT_ID" })`',
    )
  })

  test('should call handle function in tokenization class', async () => {
    const mockTokenizeHandle = vi
      .fn()
      .mockResolvedValue('623e25e1-9c40-442e-beaa-a9d7b735bdc1')

    vi.spyOn(Tokenize.prototype, 'handle').mockImplementation(
      mockTokenizeHandle,
    )

    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const token = await malgaTokenization.tokenize()

    expect(Tokenize).toHaveBeenCalledWith(configurationsSDK, getEventsOf(0))
    expect(mockTokenizeHandle).toHaveBeenCalled()
    expect(token).toBe('623e25e1-9c40-442e-beaa-a9d7b735bdc1')
  })

  test('should call eventsEmitter.on when type cardTypeChanged is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('cardTypeChanged', mockEventHandler)

    expect(getEventsOf(0).on).toHaveBeenCalledWith(
      'cardTypeChanged',
      mockEventHandler,
    )
  })

  test('should call eventsEmitter.on when type focus is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('focus', mockEventHandler)

    expect(getEventsOf(0).on).toHaveBeenCalledWith('focus', mockEventHandler)
  })

  test('should call eventsEmitter.on when type validity is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('validity', mockEventHandler)

    expect(getEventsOf(0).on).toHaveBeenCalledWith('validity', mockEventHandler)
  })

  test('should pass its own events emitter to the listener', () => {
    new MalgaTokenization(configurationsSDK)

    expect(listener).toHaveBeenCalledWith(
      configurationsSDK.options,
      getEventsOf(0),
    )
  })

  test('should keep events isolated between instances', () => {
    const first = new MalgaTokenization(configurationsSDK)
    const second = new MalgaTokenization(withContainerSuffix('-2'))
    const firstHandler = vi.fn()

    first.on('validity', firstHandler)

    expect(getEventsOf(0).on).toHaveBeenCalledWith('validity', firstHandler)
    expect(getEventsOf(1).on).not.toHaveBeenCalled()
    expect(second).not.toBe(first)
  })

  test('should refuse a second live instance with the same container, naming it', () => {
    new MalgaTokenization(configurationsSDK)

    expect(() => new MalgaTokenization(configurationsSDK)).toThrow(
      '"card-number"',
    )
  })

  test('should not clear the card collected by the instance that owns the container', () => {
    new MalgaTokenization(configurationsSDK)
    sessionStorage.setItem('malga-card-card-number', '{"cardNumber":"cifrado"}')

    expect(() => new MalgaTokenization(configurationsSDK)).toThrow()
    expect(sessionStorage.getItem('malga-card-card-number')).toBe(
      '{"cardNumber":"cifrado"}',
    )
  })

  test('should free the containers when the constructor throws', () => {
    const fieldsWithoutCardNumber: Partial<
      typeof configurationsSDK.options.config.fields
    > = { ...configurationsSDK.options.config.fields }
    delete fieldsWithoutCardNumber.cardNumber
    const withoutCardNumber = {
      ...configurationsSDK,
      options: {
        ...configurationsSDK.options,
        config: {
          ...configurationsSDK.options.config,
          fields: fieldsWithoutCardNumber,
        },
      },
    } as unknown as typeof configurationsSDK

    expect(() => new MalgaTokenization(withoutCardNumber)).toThrow(TypeError)
    expect(() => new MalgaTokenization(configurationsSDK)).not.toThrow()
  })

  test('should undo what was already set up when the constructor throws', () => {
    const removeIframes = vi.fn()
    vi.mocked(loaded).mockReturnValueOnce(removeIframes)
    vi.mocked(listener).mockImplementationOnce(() => {
      throw new Error('listener failed')
    })

    expect(() => new MalgaTokenization(configurationsSDK)).toThrow(
      'listener failed',
    )
    expect(removeIframes).toHaveBeenCalledOnce()
    expect(() => new MalgaTokenization(configurationsSDK)).not.toThrow()
  })

  test('should undo everything the constructor set up on destroy', () => {
    const removeIframes = vi.fn()
    const removeListener = vi.fn()
    vi.mocked(loaded).mockReturnValueOnce(removeIframes)
    vi.mocked(listener).mockReturnValueOnce(removeListener)

    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    sessionStorage.setItem('malga-card-card-number', '{"cardNumber":"cifrado"}')

    malgaTokenization.destroy()

    expect(removeIframes).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledOnce()
    expect(
      (getEventsOf(0) as unknown as { clear: ReturnType<typeof vi.fn> }).clear,
    ).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem('malga-card-card-number')).toBeNull()
  })

  test('should free the containers on destroy', () => {
    new MalgaTokenization(configurationsSDK).destroy()

    expect(() => new MalgaTokenization(configurationsSDK)).not.toThrow()
  })

  test('should be safe to destroy twice', () => {
    const removeIframes = vi.fn()
    vi.mocked(loaded).mockReturnValueOnce(removeIframes)
    const malgaTokenization = new MalgaTokenization(configurationsSDK)

    malgaTokenization.destroy()
    malgaTokenization.destroy()

    expect(removeIframes).toHaveBeenCalledOnce()
  })

  test('should refuse to tokenize after destroy', async () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    malgaTokenization.destroy()

    await expect(malgaTokenization.tokenize()).rejects.toThrow('destroyed')
    expect(Tokenize).not.toHaveBeenCalled()
  })
})
