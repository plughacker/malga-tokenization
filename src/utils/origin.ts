import {
  HOSTED_FIELDS_VERSION,
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

export function gettingOriginEvent(debug?: boolean, sandbox?: boolean) {
  if (debug) {
    return URL_HOSTED_FIELD_DEV
  }

  if (sandbox) {
    return URL_HOSTED_FIELD_SANDBOX
  }

  return URL_HOSTED_FIELD_PROD
}

export function gettingIframeSrc(debug?: boolean, sandbox?: boolean) {
  return `${gettingOriginEvent(debug, sandbox)}/${HOSTED_FIELDS_VERSION}/index.html`
}
