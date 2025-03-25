import {
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
