/**
 * Chama `appendElement` com o elemento do container assim que ele existir no
 * DOM. Devolve uma função que cancela a espera: destroy() não pode deixar um
 * observador pendente inserindo um iframe depois de a instância ser desmontada.
 */
export function waitingForElement(
  container: string,
  appendElement: (element: any) => void,
): () => void {
  const element = document.getElementById(container)

  if (element) {
    appendElement(element)
    return () => {}
  }

  const observerElement = new MutationObserver((_, observer) => {
    const element = document.getElementById(container)
    if (element) {
      observer.disconnect()
      appendElement(element)
    }
  })

  observerElement.observe(document.body, { childList: true, subtree: true })

  return () => observerElement.disconnect()
}
