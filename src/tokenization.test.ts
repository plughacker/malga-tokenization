import { MalgaTokenization, eventsEmitter } from './tokenization' // Adjust path as needed
import { Tokenize } from './tokenize'
import { loaded, listener } from './iframes'
import { configurationsSDK } from 'tests/mocks'

vi.mock('./tokenize')
vi.mock('./iframes')
vi.mock('./events', () => {
  const MockEvents = vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
  }))
  return { Events: MockEvents }
})

describe('tokenization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    expect(Tokenize).toHaveBeenCalledWith(configurationsSDK)
    expect(mockTokenizeHandle).toHaveBeenCalled()
    expect(token).toBe('623e25e1-9c40-442e-beaa-a9d7b735bdc1')
  })

  test('should call eventsEmitter.on when type cardTypeChanged is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('cardTypeChanged', mockEventHandler)

    expect(eventsEmitter.on).toHaveBeenCalledWith(
      'cardTypeChanged',
      mockEventHandler,
    )
  })

  test('should call eventsEmitter.on when type focus is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('focus', mockEventHandler)

    expect(eventsEmitter.on).toHaveBeenCalledWith('focus', mockEventHandler)
  })

  test('should call eventsEmitter.on when type validity is called', () => {
    const malgaTokenization = new MalgaTokenization(configurationsSDK)
    const mockEventHandler = vi.fn()

    malgaTokenization.on('validity', mockEventHandler)

    expect(eventsEmitter.on).toHaveBeenCalledWith('validity', mockEventHandler)
  })
})
