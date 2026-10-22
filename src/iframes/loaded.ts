import type {
  MalgaInputFieldConfiguration,
  MalgaInputFieldConfigurations,
  MalgaOptions,
} from 'src/interfaces'
import { create, removeIframe } from './create'
import { Event } from 'src/enums'

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
  field: any,
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
      fieldType: field,
      container: fieldConfig.container,
      cardNumberContainer: options.config.fields.cardNumber.container,
      fieldConfig: fieldConfig,
      styles: options.config?.styles,
      preventAutofill: options.config?.preventAutofill,
      debug: options?.debug,
      sandbox: options?.sandbox,
    },
    '*',
  )
}

/**
 * Cria um iframe por campo. Devolve a função que desfaz isso: tira os iframes
 * do DOM e cancela a espera pelos containers que ainda não existem.
 */
export function loaded(options: MalgaOptions): () => void {
  if (!validateConfig(options.config)) {
    return () => {}
  }

  const fields = Object.keys(options.config.fields)
  const iframes: HTMLIFrameElement[] = []

  fields.forEach((field) => {
    const fieldConfig =
      options.config.fields[field as keyof typeof options.config.fields]
    const iframe = create(fieldConfig, options.debug, options.sandbox)

    if (!iframe) {
      console.error(`Error to access the iframe of ${field}`)
      return
    }

    iframes.push(iframe)
    iframe.onload = () => onLoadIframeField(field, iframe, fieldConfig, options)
  })

  return () => {
    for (const iframe of iframes) {
      iframe.onload = null
      removeIframe(iframe)
    }
  }
}
