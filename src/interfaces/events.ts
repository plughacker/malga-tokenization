import type { Event } from 'src/enums'
import type { MalgaCreditCardFields } from './configurations'

export type EventTypeReturn =
  | 'validity'
  | 'cardTypeChanged'
  | 'focus'
  | 'blur'
  | 'updateCardValues'
export type EventTypePostMessage = Event.Submit
export type EventTypeListener = 'message'
export type EventHandler<T> = (data: T, parentNode: Element) => void

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
  field: MalgaCreditCardFields
  message: string
  code: string
}
export interface MalgaEventDataValidityReturn {
  field: MalgaCreditCardFields
  valid: boolean
  error: MalgaEventDataValidityErrorReturn
  empty: boolean
  potentialValid: boolean
  parentNode: Element | null
}

export interface MalgaEventDataCardTypeChangePayloadReturn {
  field: MalgaCreditCardFields
  parentNode: Element
  card?: CreditCardReturn
}

export interface MalgaEventDataFocusBlurReturn {
  field: MalgaCreditCardFields
  parentNode: Element
}

export interface MalgaEventDataUpdateCardValuesReturn {
  field: MalgaCreditCardFields
  value: string
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
