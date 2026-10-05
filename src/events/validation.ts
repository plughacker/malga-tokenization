import { CSSClasses, Event } from 'src/enums'
import type { MalgaEventDataValidityReturn } from 'src/interfaces'
import type { Events } from './events'

export function handGetValidationEventData(
  data: MalgaEventDataValidityReturn,
  parentNode: Element | null,
  events: Events,
) {
  const isValid = data.valid
  const isEmpty = data.empty
  const isPotentiallyValid = data.potentialValid

  if (isEmpty || isPotentiallyValid) {
    parentNode?.classList.remove(CSSClasses.Valid)
    parentNode?.classList.remove(CSSClasses.Invalid)
    return
  }

  parentNode?.classList.toggle(CSSClasses.Valid, isValid)
  parentNode?.classList.toggle(CSSClasses.Invalid, !isValid)

  events.emit(Event.Validity, {
    field: data.field,
    error: data.error,
    valid: data.valid,
    empty: data.empty,
    potentialValid: data.potentialValid,
    parentNode: parentNode,
  })
}
