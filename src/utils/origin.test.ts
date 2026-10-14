import {
  HOSTED_FIELDS_VERSION,
  URL_HOSTED_FIELD_DEV,
  URL_HOSTED_FIELD_PROD,
  URL_HOSTED_FIELD_SANDBOX,
} from 'src/constants'
import { gettingIframeSrc, gettingOriginEvent } from './origin'

describe('origin', () => {
  test.each`
    origin                      | debug    | sandbox
    ${URL_HOSTED_FIELD_DEV}     | ${true}  | ${false}
    ${URL_HOSTED_FIELD_SANDBOX} | ${false} | ${true}
    ${URL_HOSTED_FIELD_PROD}    | ${false} | ${false}
  `(
    'should load the iframe from the versioned index.html of $origin',
    ({ origin, debug, sandbox }) => {
      expect(gettingIframeSrc(debug, sandbox)).toBe(
        `${origin}/${HOSTED_FIELDS_VERSION}/index.html`,
      )
    },
  )

  test.each`
    debug    | sandbox
    ${true}  | ${false}
    ${false} | ${true}
    ${false} | ${false}
  `(
    'should validate messages against the origin only, never the path',
    ({ debug, sandbox }) => {
      const origin = gettingOriginEvent(debug, sandbox)

      expect(new URL(gettingIframeSrc(debug, sandbox)).origin).toBe(origin)
      expect(new URL(origin).pathname).toBe('/')
      expect(origin.endsWith('/')).toBe(false)
    },
  )
})
