import type {
  MalgaInputFieldConfiguration,
  MalgaInputFieldConfigurations,
  MalgaOptions,
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
  options: MalgaOptions,
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
      styles: options.config?.styles,
      preventAutofill: options.config?.preventAutofill,
      debug: options.debug,
      sandbox: options.sandbox,
    },
    URL_HOSTED_FIELD,
  )
}

export function loaded(options: MalgaOptions) {
  if (!validateConfig(options.config)) {
    return
  }

  const fields = Object.keys(options.config.fields)

  fields.forEach((field) => {
    const fieldConfig =
      options.config.fields[field as keyof typeof options.config.fields]
    const iframe = create(fieldConfig)

    if (!iframe) {
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    iframe.onload = () => onLoadIframeField(iframe, fieldConfig, options)
  })
}
