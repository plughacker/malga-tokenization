export function waitingForElement(
  container: string,
  appendElement: (element: any) => void,
) {
  const element = document.getElementById(container)

  if (element) {
    appendElement(element)
    return
  }

  const observerElement = new MutationObserver((_, observer) => {
    const element = document.getElementById(container)
    if (element) {
      observer.disconnect()
      appendElement(element)
    }
  })

  observerElement.observe(document.body, { childList: true, subtree: true })
}
