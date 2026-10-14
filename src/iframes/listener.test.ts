import { listener } from './listener'
import { CSSClasses, Event } from 'src/enums'
import {
  configurationsSDK,
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

describe('listener', () => {
  let events: { emit: ReturnType<typeof vi.fn> }
  let addEventListenerSpy: any
  let parentNode: HTMLElement

  beforeEach(() => {
    events = { emit: vi.fn() }
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    parentNode = document.createElement('div')

    parentNode.id = 'card-number'

    vi.spyOn(parentNode.classList, 'toggle')

    vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'card-number' ? parentNode : null,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()

    parentNode.classList.remove(CSSClasses.Focused)
  })

  test('should add a message event listener to the window', () => {
    listener(
      { ...configurationsSDK.options, debug: true, sandbox: false },
      events as any,
    )

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
      listener({ ...configurationsSDK.options, debug, sandbox }, events as any)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockEvent('successOrigin', url)

      messageHandler(event)

      expect(document.getElementById).toHaveBeenCalledWith(
        event.data.data.field,
      )

      expect(document.getElementById).toHaveBeenCalledTimes(1)
    },
  )

  test('should ignore messages from incorrect origins', () => {
    listener(configurationsSDK.options, events as any)

    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent('message', 'https://wrong-origin.com')

    messageHandler(event)

    expect(document.getElementById).not.toHaveBeenCalled()
  })

  test.each`
    url                         | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should emit Validity event for Validity event type',
    ({ url, debug, sandbox }) => {
      listener({ ...configurationsSDK.options, debug, sandbox }, events as any)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockValidityEvent(Event.Validity, url)

      messageHandler(event)

      console.log('event data', event)

      expect(events.emit).toHaveBeenCalledWith('validity', {
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
      listener({ ...configurationsSDK.options, debug, sandbox }, events as any)

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

      expect(events.emit).toHaveBeenCalledWith('cardTypeChanged', {
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
      listener({ ...configurationsSDK.options, debug, sandbox }, events as any)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      const event = handleCreateMockEvent(Event.Focus, url)

      messageHandler(event)

      expect(events.emit).toHaveBeenCalledWith('focus', {
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

    listener({ ...configurationsSDK.options, debug, sandbox }, events as any)

    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Blur, url)

    messageHandler(event)

    expect(events.emit).toHaveBeenCalledWith('blur', {
      field: 'card-number',
      parentNode: expect.any(Element),
    })

    expect(parentNode.classList.contains(CSSClasses.Focused)).toBe(false)
  })

  test('should ignore messages from fields of another instance', () => {
    listener(configurationsSDK.options, events as any)

    const messageHandler = addEventListenerSpy.mock.calls[0][1]

    const event = handleCreateMockEvent(Event.Focus, URL_HOSTED_FIELD_PROD)
    event.data.data.field = 'card-number-other'

    messageHandler(event)

    expect(document.getElementById).not.toHaveBeenCalled()
    expect(events.emit).not.toHaveBeenCalled()
  })

  test.each`
    containers
    ${{ cardNumber: 'num', cardHolderName: 'nome', cardCvv: 'cvv', cardExpirationDate: 'validade' }}
    ${{ cardNumber: 'card_number', cardHolderName: 'card_holder', cardCvv: 'card_cvv', cardExpirationDate: 'card_exp' }}
    ${{ cardNumber: 'card.number', cardHolderName: '1-holder', cardCvv: 'cvv-2', cardExpirationDate: 'exp:date' }}
  `(
    'should collect the card by field key whatever the container names: $containers.cardNumber',
    ({ containers }) => {
      vi.mocked(document.getElementById).mockRestore()

      const fields = Object.fromEntries(
        Object.entries(containers as Record<string, string>).map(
          ([fieldKey, container]) => {
            const element = document.createElement('div')
            element.id = container
            document.body.appendChild(element)
            return [fieldKey, { container }]
          },
        ),
      )

      const options = {
        ...configurationsSDK.options,
        config: { ...configurationsSDK.options.config, fields },
      } as any

      listener(options, events as any)

      const messageHandler = addEventListenerSpy.mock.calls[0][1]

      for (const [fieldKey, container] of Object.entries(
        containers as Record<string, string>,
      )) {
        const event = handleCreateMockEvent(
          Event.UpdateCardValues,
          URL_HOSTED_FIELD_PROD,
        )
        event.data.data = {
          field: container,
          value: `cifrado-${fieldKey}`,
        } as any
        messageHandler(event)
      }

      expect(
        JSON.parse(
          sessionStorage.getItem(`malga-card-${containers.cardNumber}`) || '{}',
        ),
      ).toEqual({
        cardNumber: 'cifrado-cardNumber',
        cardHolderName: 'cifrado-cardHolderName',
        cardCvv: 'cifrado-cardCvv',
        cardExpirationDate: 'cifrado-cardExpirationDate',
      })

      document.body.innerHTML = ''
    },
  )
})
