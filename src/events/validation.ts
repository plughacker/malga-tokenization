import { CSSClasses } from 'src/enums'
import { eventsEmitter } from 'src/tokenization'

export function validation(data: any, parentNode: Element | null) {
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

  eventsEmitter.emit('validity', {
    field: data.fieldType,
    error: data.error,
    valid: data.valid,
    parent: parentNode,
  })
}
