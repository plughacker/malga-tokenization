import { eventsEmitter } from 'src/tokenization'
import { EventListener } from '../form-events'

export function change() {
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event) => {
    const { type, data } = event.data

    const parentNode = document.querySelector(`#${data?.fieldType}`)
    if (!parentNode) return

    if (type === 'validation') {
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
      })
    }

    if (type === 'focus' || type === 'blur') {
      parentNode?.classList.toggle('malga-hosted-field-focused')

      eventsEmitter.emit(type === 'focus' ? 'focus' : 'blur', {
        field: data.fieldType,
        parentNode: parentNode,
      })
    }
  })
}
