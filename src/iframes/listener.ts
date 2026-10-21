import { CSSClasses, EventEmits, Event } from 'src/enums'
import { EventListener, handGetValidationEventData } from 'src/events'
import type { Events } from 'src/events'
import type {
  MalgaEventDataValidityReturn,
  EventHandler,
  ListenerContext,
  MalgaOptions,
  MalgaEventDataCardTypeChangePayloadReturn,
} from 'src/interfaces'
import { getStorageKey, gettingOriginEvent } from 'src/utils'

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

function handleEventUpdateCardValues(
  data: { field: string; value: string },
  _parentNode: Element,
  _events: Events,
  context: ListenerContext,
) {
  const fieldKey = context.fieldKeys.get(data.field)

  if (!fieldKey) return

  const currentCardData = JSON.parse(
    sessionStorage.getItem(context.storageKey) || '{}',
  )

  const updatedData = {
    ...currentCardData,
    [fieldKey]: data.value,
  }

  sessionStorage.setItem(context.storageKey, JSON.stringify(updatedData))
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
  const context: ListenerContext = {
    fieldKeys: new Map(
      Object.entries(options.config.fields).map(([fieldKey, field]) => [
        field.container,
        fieldKey,
      ]),
    ),
    storageKey: getStorageKey(options),
  }
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event: MessageEvent<any>) => {
    const origin = gettingOriginEvent(debug, sandbox)

    if (event.origin !== origin) {
      return `Unauthorized origin: ${event.origin}`
    }

    try {
      const { eventType, data } = event.data

      if (!context.fieldKeys.has(data?.field)) return

      const parentNode = document.getElementById(data.field)

      if (!parentNode) return

      const handler = eventHandlers[eventType]

      if (handler) {
        handler(data, parentNode, events, context)
      } else {
        console.warn(`Unhandled event type: ${eventType}`)
      }
    } catch (error) {
      console.error('Error handling message event:', error)
    }
  })
}
