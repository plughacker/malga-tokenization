import type { MalgaCreditCardFields } from 'src/interfaces'

export function waitingForElement(
  container: MalgaCreditCardFields,
  appendElement: (element: any) => void,
) {
  const element = document.querySelector(`#${container}`)

  if (element) {
    appendElement(element as HTMLElement)
    return
  }

  const observerElement = new MutationObserver((_, observer) => {
    const element = document.querySelector(`#${container}`)
    if (element) {
      observer.disconnect()
      appendElement(element as HTMLElement)
    }
  })

  observerElement.observe(document.body, { childList: true, subtree: true })
}
