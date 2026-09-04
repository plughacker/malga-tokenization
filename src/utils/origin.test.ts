import { HOSTED_FIELDS_VERSION, URL_HOSTED_FIELD_PROD } from 'src/constants'
import { gettingHostedFieldsUrl, gettingOriginEvent } from './origin'

describe('origem e URL do hosted-fields', () => {
  test('should keep the origin without a path', () => {
    // event.origin de um postMessage nunca traz caminho: se esta função passar a
    // devolver a versão, toda mensagem legítima é recusada
    expect(gettingOriginEvent(false, false)).toBe(URL_HOSTED_FIELD_PROD)
    expect(gettingOriginEvent(false, false)).not.toContain(
      HOSTED_FIELDS_VERSION,
    )
  })

  test('should point the iframe at the versioned path', () => {
    expect(gettingHostedFieldsUrl(false, false)).toBe(
      `${URL_HOSTED_FIELD_PROD}/${HOSTED_FIELDS_VERSION}`,
    )
  })

  test('should version the path in every environment', () => {
    for (const [debug, sandbox] of [
      [true, false],
      [false, true],
      [false, false],
    ]) {
      const url = gettingHostedFieldsUrl(debug, sandbox)
      expect(url.startsWith(gettingOriginEvent(debug, sandbox))).toBe(true)
      expect(url.endsWith(`/${HOSTED_FIELDS_VERSION}`)).toBe(true)
    }
  })
})
