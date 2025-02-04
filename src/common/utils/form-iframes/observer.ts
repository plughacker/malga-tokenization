import type { MalgaInputFieldConfiguration } from 'src/common/interfaces'
import { EventListener } from '../form-events'

export function observerElementsInDOM(
  fieldConfig: MalgaInputFieldConfiguration,
  iframe: HTMLIFrameElement,
) {
  const documentToObserve = new EventListener(document)

  function waitingForElement(
    field: string,
    appendElement: (element: HTMLElement) => void,
  ) {
    const element = document.querySelector(field)

    if (element) {
      appendElement(element as HTMLElement)
      return
    }

    const observerElement = new MutationObserver((_, observer) => {
      const element = document.querySelector(field)
      if (element) {
        observer.disconnect()
        appendElement(element as HTMLElement)
      }
    })

    observerElement.observe(document.body, { childList: true, subtree: true })
  }

  documentToObserve.get('DOMContentLoaded', () => {
    waitingForElement(fieldConfig.container, (div) => {
      div?.appendChild(iframe)
    })
  })
}
