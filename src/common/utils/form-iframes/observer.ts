export function waitingForElement(
  field: string,
  appendElement: (element: any) => void,
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
