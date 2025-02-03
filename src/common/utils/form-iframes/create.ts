export function create(type: string) {
  const iframe = document.createElement('iframe')

  iframe.setAttribute('name', type)
  iframe.setAttribute('src', 'https://develop.d3krxmg1839vaa.amplifyapp.com/')
  iframe.setAttribute('width', '100%')
  iframe.setAttribute('height', '100%')
  iframe.setAttribute('frameborder', '0')

  return iframe
}
