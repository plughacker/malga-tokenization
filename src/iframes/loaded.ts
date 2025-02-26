import type {
  MalgaInputFieldConfiguration,
  MalgaInputFieldConfigurations,
} from 'src/interfaces'
import { create } from './create'
import { Event } from 'src/enums'
import { URL_HOSTED_FIELD } from 'src/constants'

function validateConfig(config: MalgaInputFieldConfigurations): boolean {
  if (!config || typeof config !== 'object') {
    console.error('Invalid configuration object')
    return false
  }

  if (!config.fields || typeof config.fields !== 'object') {
    console.error('Invalid fields configuration')
    return false
  }

  return true
}

function onLoadIframeField(
  iframe: HTMLIFrameElement,
  fieldConfig: MalgaInputFieldConfiguration,
  config: MalgaInputFieldConfigurations,
) {
  if (!iframe.contentWindow) {
    console.error('iframe.contentWindow is null, cannot send postMessage')
    return
  }

  iframe.contentWindow.postMessage(
    {
      type: Event.SetTypeField,
      field: fieldConfig.container,
      fieldConfig: fieldConfig,
      styles: config.styles,
      preventAutofill: config.preventAutofill ?? true,
    },
    URL_HOSTED_FIELD,
  )
}

export function loaded(config: MalgaInputFieldConfigurations) {
  if (!validateConfig(config)) {
    return
  }

  const fields = Object.keys(config.fields)

  fields.forEach((field) => {
    const fieldConfig = config.fields[field as keyof typeof config.fields]
    const iframe = create(fieldConfig)

    if (!iframe) {
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    iframe.onload = () => onLoadIframeField(iframe, fieldConfig, config)
  })
}
