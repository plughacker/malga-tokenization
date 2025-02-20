import { validation } from 'src/events'
import { listener } from './listener'
import { CSSClasses, Event } from 'src/enums'
import { eventsEmitter } from 'src/tokenization'
import { handleCreateMockEvent } from 'tests/mocks'

vi.mock('src/events', async () => {
  const actual = await vi.importActual('src/events')
  const actualExports =
    typeof actual === 'object' && actual !== null ? actual : {}

  return {
    ...actualExports,
    validation: vi.fn(),
  }
})

vi.mock('src/tokenization', () => ({
  eventsEmitter: {
    emit: vi.fn(),
  },
}))

describe('listener', () => {
  let addEventListenerSpy: any
  let parentNode: HTMLElement

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    parentNode = document.createElement('div')

    parentNode.id = 'card-number'
    vi.spyOn(parentNode.classList, 'toggle')

    document.querySelector = vi.fn((selector) => {
      if (selector === '#card-number') return parentNode
      return null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    parentNode.classList.remove(CSSClasses.Focused)
  })

  test('should add a message event listener to the window', () => {
    listener()
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )
  })

  test('should get the data and type from event with correct origin', () => {
    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent('successOrigin')
    messageHandler(event)

    expect(document.querySelector).toHaveBeenCalledWith(
      `#${event.data.data.fieldType}`,
    )
    expect(document.querySelector).toHaveBeenCalledTimes(1)
  })

  test('should ignore messages from incorrect origins', () => {
    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent('test', 'https://wrong-origin.com')

    messageHandler(event)
    expect(document.querySelector).not.toHaveBeenCalled()
  })

  test('should call validation for Validity event type', () => {
    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Validity)

    messageHandler(event)
    expect(validation).toHaveBeenCalledWith(
      event.data.data,
      expect.any(Element),
    )
  })

  test('should emit CardTypeChanged event for CardTypeChanged event type', () => {
    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]
    const event = handleCreateMockEvent(Event.CardTypeChanged)

    const updateEvent = {
      ...event,
      data: {
        ...event.data,
        data: {
          ...event.data.data,
          card: 'visa',
        },
      },
    }

    messageHandler(updateEvent)

    expect(eventsEmitter.emit).toHaveBeenCalledWith('cardTypeChanged', {
      card: 'visa',
      parentNode: expect.any(Element),
    })
  })

  test('should emit Focus event for Focus event type', () => {
    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Focus)

    messageHandler(event)
    expect(eventsEmitter.emit).toHaveBeenCalledWith('focus', {
      field: 'card-number',
      parentNode: expect.any(Element),
    })
    expect(parentNode.classList.toggle).toHaveBeenCalledWith(CSSClasses.Focused)
    expect(parentNode.classList.contains(CSSClasses.Focused)).toBe(true)
  })

  test('should emit Blur event for Blur event type', () => {
    parentNode.classList.add(CSSClasses.Focused)

    listener()
    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Blur)

    messageHandler(event)
    expect(eventsEmitter.emit).toHaveBeenCalledWith('blur', {
      field: 'card-number',
      parentNode: expect.any(Element),
    })
    expect(parentNode.classList.toggle).toHaveBeenCalledWith(CSSClasses.Focused)
    expect(parentNode.classList.contains(CSSClasses.Focused)).toBe(false)
  })
})
