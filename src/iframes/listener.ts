import { CSSClasses, EventEmits, Event } from 'src/enums'
import { EventListener, handGetValidationEventData } from 'src/events'
import type {
  MalgaEventDataValidityReturn,
  MalgaCreditCardFields,
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

function handleEventFocus(
  data: { field: MalgaCreditCardFields },
  parentNode: Element,
) {
  parentNode.classList.add(CSSClasses.Focused)
  eventsEmitter.emit(EventEmits.Focus, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventBlur(
  data: { field: MalgaCreditCardFields },
  parentNode: Element,
) {
  parentNode.classList.remove(CSSClasses.Focused)
  eventsEmitter.emit(EventEmits.Blur, {
    field: data.field,
    parentNode: parentNode,
  })
}

function handleEventUpdateCardValues(data: {
  field: MalgaCreditCardFields
  value: string
}) {
  const currentCardData = JSON.parse(sessionStorage.getItem('card') || '{}')
  const camelCaseField = data.field.replace(/-([a-z])/g, (g: string) =>
    g[1].toUpperCase(),
  )

  const updatedCardData = {
    ...currentCardData,
    [camelCaseField]: data.value,
  }

  sessionStorage.setItem('malga-card', JSON.stringify(updatedCardData))
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
    console.log(event.origin)
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
