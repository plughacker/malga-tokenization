import type { MalgaInputFieldConfigurations } from 'src/common/interfaces'
import { EventPostMessage } from '../form-events'
import { create } from './create'
import { camelToKebabCase } from './parsedString'
import { Event } from 'src/common/enums'

export function loaded(config: MalgaInputFieldConfigurations) {
  const fields = Object.keys(config.fields)

  for (const field of fields) {
    const fieldConfig = config.fields[field]

    const iframe = create(field)
    const iframeName = camelToKebabCase(field)

    if (!iframe || !iframe.contentWindow) {
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    const parentNode = document.querySelector(fieldConfig.container)

    if (!parentNode) {
      console.error(`Container not found ${field}: ${fieldConfig.container}`)
      return
    }

    parentNode?.appendChild(iframe)

    const iframePostmessage = new EventPostMessage(iframe.contentWindow, '*')

    iframe.onload = () => {
      iframePostmessage.send(Event.SetTypeField, {
        fieldType: iframeName,
      })

      iframe.onload = null
    }
  }
}
