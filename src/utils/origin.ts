import {
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'

export function gettingOriginEvent(debug?: boolean, sandbox?: boolean) {
  console.log('dentro da função gerrinOriginEvent', debug, sandbox)
  if (debug) {
    console.log('entrou aqui entao')
    return URL_HOSTED_FIELD_DEV
  }

  if (sandbox) {
    return URL_HOSTED_FIELD_SANDBOX
  }

  return URL_HOSTED_FIELD_PROD
}
