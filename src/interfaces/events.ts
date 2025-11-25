import type { Event } from 'src/enums'

export type EventTypeReturn =
  | 'validity'
  | 'cardTypeChanged'
  | 'focus'
  | 'blur'
  | 'updateCardValues'
export type EventTypePostMessage = Event.Submit | 'updateField'
export type EventTypeListener = 'message'
export type EventHandler<T> = (
  data: T,
  parentNode: Element,
  debug?: boolean,
  sandbox?: boolean,
) => void

interface CreditCardReturn {
  niceType: string
  type: string
  patterns: (number | number[])[]
  gaps: number[]
  lengths: number[]
  code: {
    name: string
    size: number
  }
}

export interface MalgaEventDataValidityErrorReturn {
  field: string
  message: string
  code: string
}
export interface MalgaEventDataValidityReturn {
  field: string
  valid: boolean
  error: MalgaEventDataValidityErrorReturn
  empty: boolean
  potentialValid: boolean
  parentNode: Element | null
}

export interface MalgaEventDataCardTypeChangePayloadReturn {
  field: string
  parentNode: Element
  card?: CreditCardReturn
}

export interface MalgaEventDataFocusBlurReturn {
  field: string
  parentNode: Element
}

export interface MalgaEventDataUpdateCardValuesReturn {
  field: string
  value: string
  cardNumberContainer?: string
  debug?: boolean
  sandbox?: boolean
}

export interface EventPayloadReturnObject {
  cardTypeChanged: MalgaEventDataCardTypeChangePayloadReturn
  validity: MalgaEventDataValidityReturn
  focus: MalgaEventDataFocusBlurReturn
  blur: MalgaEventDataFocusBlurReturn
  updateCardValues: MalgaEventDataUpdateCardValuesReturn
}
