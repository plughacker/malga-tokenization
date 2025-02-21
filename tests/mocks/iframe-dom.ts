export function handleSetupIframeInDOM(
  iframeName: string,
  mockValue: any,
): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.name = iframeName
  document.body.appendChild(iframe)

  Object.defineProperty(iframe, 'contentWindow', {
    value: mockValue,
    writable: true,
  })

  return iframe
}

export function handleRemoveIframe(iframe: HTMLIFrameElement) {
  if (document.body.contains(iframe)) {
    document.body.removeChild(iframe)
  }

  return
}
