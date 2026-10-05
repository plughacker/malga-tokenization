import { CSSClasses, EventEmits, Event } from 'src/enums'
import { EventListener, handGetValidationEventData } from 'src/events'
import type { Events } from 'src/events'
import type {
  MalgaEventDataValidityReturn,
  EventHandler,
  MalgaOptions,
  MalgaEventDataCardTypeChangePayloadReturn,
} from 'src/interfaces'
import { gettingOriginEvent } from 'src/utils'

function handleEventValidity(
  data: MalgaEventDataValidityReturn,
  parentNode: Element,
  events: Events,
) {
  handGetValidationEventData(data, parentNode, events)
}

function handleEventCardTypeChanged(
  data: MalgaEventDataCardTypeChangePayloadReturn,
  parentNode: Element,
  events: Events,
) {
  events.emit(Event.CardTypeChanged, {
    field: data.field,
    parentNode: parentNode,
    card: data.card,
  })
}

function handleEventFocus(
  data: { field: string },
  parentNode: Element,
  events: Events,
) {
  parentNode.classList.add(CSSClasses.Focused)
  events.emit(EventEmits.Focus, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventBlur(
  data: { field: string },
  parentNode: Element,
  events: Events,
) {
  parentNode.classList.remove(CSSClasses.Focused)
  events.emit(EventEmits.Blur, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventUpdateCardValues(data: {
  field: string
  value: string
  cardNumberContainer?: string
}) {
  const storageKey = `malga-card-${data.cardNumberContainer || data.field}`

  const currentCardData = JSON.parse(sessionStorage.getItem(storageKey) || '{}')

  const camelCaseField = data.field
    .replace(/[^a-z-]/gi, '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/-/g, '')

  const updatedData = {
    ...currentCardData,
    [camelCaseField]: data.value,
  }

  sessionStorage.setItem(storageKey, JSON.stringify(updatedData))
}

const eventHandlers: { [key: string]: EventHandler<any> } = {
  [Event.Validity]: handleEventValidity,
  [Event.CardTypeChanged]: handleEventCardTypeChanged,
  [Event.Focus]: handleEventFocus,
  [Event.Blur]: handleEventBlur,
  [Event.UpdateCardValues]: handleEventUpdateCardValues,
}

export function listener(options: MalgaOptions, events: Events) {
  const { debug, sandbox } = options
  const containers = new Set(
    Object.values(options.config.fields).map((field) => field.container),
  )
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event: MessageEvent<any>) => {
    const origin = gettingOriginEvent(debug, sandbox)

    if (event.origin !== origin) {
      return `Unauthorized origin: ${event.origin}`
    }

    try {
      const { eventType, data } = event.data

      if (!containers.has(data?.field)) return

      const parentNode = document.querySelector(`#${data?.field}`)

      if (!parentNode) return

      const handler = eventHandlers[eventType]

      if (handler) {
        handler(data, parentNode, events)
      } else {
        console.warn(`Unhandled event type: ${eventType}`)
      }
    } catch (error) {
      console.error('Error handling message event:', error)
    }
  })
}
