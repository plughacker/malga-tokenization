import { EventPostMessage } from '../form-events'
import { create } from './create'
import { camelToKebabCase } from './parsedString'

export function loaded(configFields: any) {
  const fields = Object.keys(configFields)

  for (const field of fields) {
    const iframe = create(field)
    const iframeName = camelToKebabCase(field)
    if (!iframe || !iframe.contentWindow) return

    const iframePostmessage = new EventPostMessage(iframe.contentWindow, '*')

    iframe.onload = () => {
      iframePostmessage.send('setTypeField', {
        fieldType: iframeName,
      })
    }
  }
}
