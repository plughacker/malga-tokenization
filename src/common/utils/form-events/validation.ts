import { eventsEmitter } from 'src/tokenization'

export function validation(parentNode: any, data: any) {
  const isValid = data.valid
  const isEmpty = data.empty
  const isPotentiallyValid = data.potentialValid

  if (isEmpty || isPotentiallyValid) {
    parentNode?.classList.remove('malga-hosted-field-valid')
    parentNode?.classList.remove('malga-hosted-field-invalid')
    return
  }

  parentNode?.classList.toggle('malga-hosted-field-valid', isValid)
  parentNode?.classList.toggle('malga-hosted-field-invalid', !isValid)

  eventsEmitter.emit('validity', {
    field: data.fieldType,
    error: data.error,
    valid: data.valid,
    parent: parentNode,
  })
}
