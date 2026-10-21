import { listener } from './listener'
import { CSSClasses, Event } from 'src/enums'
import { eventsEmitter } from 'src/tokenization'
import {
  handleCreateMockEvent,
  handleCreateMockValidityEvent,
} from 'tests/mocks'
import {
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

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
    listener(true, false)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )
  })

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should get the data and type from event with correct origin: $url',
    ({ url, debug, sandbox }) => {
      listener(debug, sandbox)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockEvent('successOrigin', url)

      messageHandler(event)

      expect(document.querySelector).toHaveBeenCalledWith(
        `#${event.data.data.field}`,
      )

      expect(document.querySelector).toHaveBeenCalledTimes(1)
    },
  )

  test('should ignore messages from incorrect origins', () => {
    listener()

    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent('message', 'https://wrong-origin.com')

    messageHandler(event)

    expect(document.querySelector).not.toHaveBeenCalled()
  })

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should emit Validity event for Validity event type',
    ({ url, debug, sandbox }) => {
      listener(debug, sandbox)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockValidityEvent(Event.Validity, url)

      messageHandler(event)

      console.log('event data', event)

      expect(eventsEmitter.emit).toHaveBeenCalledWith('validity', {
        field: event.data.data.field,
        valid: event.data.data.valid,
        empty: event.data.data.empty,
        potentialValid: event.data.data.potentialValid,
        parentNode: expect.any(Element),
      })
    },
  )

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should emit CardTypeChanged event for CardTypeChanged event type',
    ({ url, debug, sandbox }) => {
      listener(debug, sandbox)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockEvent(Event.CardTypeChanged, url)

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
        field: 'card-number',
      })
    },
  )

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should emit Focus event for Focus event type',
    ({ url, debug, sandbox }) => {
      listener(debug, sandbox)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockEvent(Event.Focus, url)

      messageHandler(event)

      expect(eventsEmitter.emit).toHaveBeenCalledWith('focus', {
        field: 'card-number',
        parentNode: expect.any(Element),
      })

      expect(parentNode.classList.contains(CSSClasses.Focused)).toBe(true)
    },
  )

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `('should emit Blur event for Blur event type', ({ url, debug, sandbox }) => {
    parentNode.classList.add(CSSClasses.Focused)

    listener(debug, sandbox)

    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Blur, url)

    messageHandler(event)

    expect(eventsEmitter.emit).toHaveBeenCalledWith('blur', {
      field: 'card-number',
      parentNode: expect.any(Element),
    })

    expect(parentNode.classList.contains(CSSClasses.Focused)).toBe(false)
  })
})
