import { EventListener } from '../form-events'

export function change() {
  const windowMessage = new EventListener(window)

  windowMessage.listener('message', (event) => {
    const { type, data } = event.data

    const parentNode = document.querySelector(`#${data?.fieldType}`)

    if (!parentNode) return

    if (type === 'focus') {
      parentNode?.classList.toggle('malga-hosted-field-focused')
    }

    if (type === 'blur') {
      parentNode?.classList.toggle('malga-hosted-field-focused')
    }
  })
}
