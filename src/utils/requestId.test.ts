import { generateRequestId } from './requestId'

describe('generateRequestId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('should use crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-from-crypto' })

    expect(generateRequestId()).toBe('uuid-from-crypto')
  })

  test('should generate a fallback id when crypto is not available', () => {
    vi.stubGlobal('crypto', undefined)

    expect(generateRequestId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
  })

  test('should generate a fallback id when randomUUID is not available', () => {
    vi.stubGlobal('crypto', {})

    expect(generateRequestId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
  })

  test('should generate different ids on each call', () => {
    vi.stubGlobal('crypto', undefined)

    expect(generateRequestId()).not.toBe(generateRequestId())
  })
})
