import type { MalgaInputFieldConfigurations } from 'src/common/interfaces'
import { create } from './create'
import { Event } from 'src/common/enums'
import { camelToKebabCase } from './parsedString'

export function loaded(config: MalgaInputFieldConfigurations) {
  const fields = Object.keys(config.fields)

  for (const field of fields) {
    const fieldConfig = config.fields[field as keyof typeof config.fields]

    const iframe = create(field, fieldConfig)
    const iframeName = camelToKebabCase(field)

    if (!iframe) {
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    iframe.onload = () => {
      if (!iframe.contentWindow) {
        console.error('iframe.contentWindow is null, cannot send postMessage')
        return
      }

      iframe.contentWindow.postMessage(
        {
          type: Event.SetTypeField,
          fieldType: iframeName,
          fieldConfig: fieldConfig,
          styles: config.styles,
          preventAutofill: config.preventAutofill ?? true,
        },
        '*',
      )
    }
  }
}
