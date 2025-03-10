import type { Event } from 'src/enums'
import type { MalgaContainer } from './configurations'

export type EventTypeReturn = 'validity' | 'cardTypeChanged' | 'focus' | 'blur'
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
  field: MalgaContainer
  message: string
  code: string
}
export interface MalgaEventDataValidityReturn {
  field: MalgaContainer
  valid: boolean
  error: MalgaEventDataValidityErrorReturn
  empty: boolean
  potentialValid: boolean
  parentNode: Element | null
}

export interface MalgaEventDataCardTypeChangePayloadReturn {
  field: MalgaContainer
  parentNode: Element
  card?: CreditCardReturn
}

export interface MalgaEventDataFocusBlurReturn {
  field: MalgaContainer
  parentNode: Element
}

export interface EventPayloadReturnObject {
  cardTypeChanged: MalgaEventDataCardTypeChangePayloadReturn
  validity: MalgaEventDataValidityReturn
  focus: MalgaEventDataFocusBlurReturn
  blur: MalgaEventDataFocusBlurReturn
}
