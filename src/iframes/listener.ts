import { CSSClasses, EventEmits, Event } from 'src/enums'
import { EventListener, handGetValidationEventData } from 'src/events'
import type {
  MalgaEventDataValidityReturn,
  EventHandler,
  MalgaEventDataCardTypeChangePayloadReturn,
} from 'src/interfaces'
import { eventsEmitter } from 'src/tokenization'
import { gettingOriginEvent } from 'src/utils'

function handleEventValidity(
  data: MalgaEventDataValidityReturn,
  parentNode: Element,
) {
  handGetValidationEventData(data, parentNode)
}

function handleEventCardTypeChanged(
  data: MalgaEventDataCardTypeChangePayloadReturn,
  parentNode: Element,
) {
  eventsEmitter.emit(Event.CardTypeChanged, {
    field: data.field,
    parentNode: parentNode,
    card: data.card,
  })
}

function handleEventFocus(data: { field: string }, parentNode: Element) {
  parentNode.classList.add(CSSClasses.Focused)
  eventsEmitter.emit(EventEmits.Focus, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventBlur(data: { field: string }, parentNode: Element) {
  parentNode.classList.remove(CSSClasses.Focused)
  eventsEmitter.emit(EventEmits.Blur, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventUpdateCardValues(data: {
  field: string
  value: string
  storageKey?: string
}) {
  const suffix = data.field.match(/-(\d+)$/)?.[1] ?? ''
  const containerBase = suffix ? `card-number-${suffix}` : 'card-number'
  const storageKey = `malga-card-${containerBase}`

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

export function listener(debug?: boolean, sandbox?: boolean) {
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event: MessageEvent<any>) => {
    const origin = gettingOriginEvent(debug, sandbox)

    if (event.origin !== origin) {
      return `Unauthorized origin: ${event.origin}`
    }

    try {
      const { eventType, data } = event.data

      const parentNode = document.querySelector(`#${data?.field}`)

      if (!parentNode) return

      const handler = eventHandlers[eventType]

      if (handler) {
        handler(data, parentNode)
      } else {
        console.warn(`Unhandled event type: ${eventType}`)
      }
    } catch (error) {
      console.error('Error handling message event:', error)
    }
  })
}
