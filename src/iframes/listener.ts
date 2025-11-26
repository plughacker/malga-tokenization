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
  cardNumberContainer?: string
}) {
  console.log('[TOKENIZATION] handleEventUpdateCardValues received:', {
    field: data.field,
    cardNumberContainer: data.cardNumberContainer,
    valueLength: data.value?.length || 0,
    hasValue: !!data.value,
  })

  const storageKey = `malga-card-${data.cardNumberContainer || data.field}`
  console.log('[TOKENIZATION] storageKey:', storageKey)

  const currentCardData = JSON.parse(sessionStorage.getItem(storageKey) || '{}')
  console.log('[TOKENIZATION] currentCardData before update:', currentCardData)

  const camelCaseField = data.field
    .replace(/[^a-z-]/gi, '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/-/g, '')

  console.log('[TOKENIZATION] camelCaseField:', data.field, '->', camelCaseField)

  const updatedData = {
    ...currentCardData,
    [camelCaseField]: data.value,
  }

  console.log('[TOKENIZATION] updatedData:', {
    ...updatedData,
    // Truncate values for readability
    cardNumber: updatedData.cardNumber ? `${updatedData.cardNumber.substring(0, 20)}...` : undefined,
    cardHolderName: updatedData.cardHolderName ? `${updatedData.cardHolderName.substring(0, 20)}...` : undefined,
    cardCvv: updatedData.cardCvv ? `${updatedData.cardCvv.substring(0, 20)}...` : undefined,
    cardExpirationDate: updatedData.cardExpirationDate ? `${updatedData.cardExpirationDate.substring(0, 20)}...` : undefined,
  })

  sessionStorage.setItem(storageKey, JSON.stringify(updatedData))
  console.log('[TOKENIZATION] sessionStorage updated for key:', storageKey)
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
      console.log('[TOKENIZATION] Ignoring message from unauthorized origin:', event.origin, 'expected:', origin)
      return `Unauthorized origin: ${event.origin}`
    }

    try {
      const { eventType, data } = event.data

      console.log('[TOKENIZATION] Message received:', { eventType, field: data?.field })

      // For updateCardValues, we don't need a parentNode
      if (eventType === Event.UpdateCardValues) {
        console.log('[TOKENIZATION] Processing UpdateCardValues event')
        handleEventUpdateCardValues(data)
        return
      }

      const parentNode = document.querySelector(`#${data?.field}`)

      if (!parentNode) {
        console.log('[TOKENIZATION] parentNode not found for field:', data?.field)
        return
      }

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
