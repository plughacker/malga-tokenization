import { isCompatibleVersion } from './check-hosted-fields.js'

describe('isCompatibleVersion', () => {
  test('aceita o próprio major e builds mais novos do mesmo major', () => {
    expect(isCompatibleVersion('4.0.0', '4.0.0')).toBe(true)
    expect(isCompatibleVersion('4.2.0', '4.0.0')).toBe(true)
    expect(isCompatibleVersion('4.0.3', '4.0.0')).toBe(true)
    expect(isCompatibleVersion('4.2.1', '4.1.5')).toBe(true)
  })

  test('recusa outro major e builds mais antigos que a constante', () => {
    expect(isCompatibleVersion('5.0.0', '4.0.0')).toBe(false)
    expect(isCompatibleVersion('3.9.9', '4.0.0')).toBe(false)
    expect(isCompatibleVersion('4.1.4', '4.1.5')).toBe(false)
    expect(isCompatibleVersion('4.0.9', '4.1.0')).toBe(false)
  })

  test('recusa versões malformadas', () => {
    expect(isCompatibleVersion('', '4.0.0')).toBe(false)
    expect(isCompatibleVersion('4.2', '4.0.0')).toBe(false)
    expect(isCompatibleVersion('4.2.0-beta', '4.0.0')).toBe(false)
  })
})
