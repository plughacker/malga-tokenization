import { eventsEmitter } from 'src/tokenization'
import { EventListener } from '../form-events'

export function change() {
  const windowMessage = new EventListener(window.parent)

  windowMessage.listener('message', (event) => {
    const { type, data } = event.data
    console.log('type', type)
    const parentNode = document.querySelector(`#${data?.fieldType}`)

    if (!parentNode) return

    if (type === 'validation') {
      const isValid = data.valid
      const isEmpty = data.empty
      const isPotentiallyValid = data.potentialValid

      eventsEmitter.emit('validate', {
        field: data.fieldType,
        error: data.error,
        valid: data.valid,
      })

      if (isEmpty || isPotentiallyValid) {
        parentNode?.classList.remove('malga-hosted-field-valid')
        parentNode?.classList.remove('malga-hosted-field-invalid')
      } else {
        const classToAdd = isValid
          ? 'malga-hosted-field-valid'
          : 'malga-hosted-field-invalid'
        const classToRemove = isValid
          ? 'malga-hosted-field-invalid'
          : 'malga-hosted-field-valid'

        parentNode?.classList.add(classToAdd)
        parentNode?.classList.remove(classToRemove)
      }
    }

    if (type === 'focus' || type === 'blur') {
      parentNode?.classList.toggle('malga-hosted-field-focused')
    }
  })
}
