import { CSSClasses } from 'src/enums'
import { configurationsSDK } from 'tests/mocks'
import { MalgaTokenization } from './tokenization'
import { clearContainersInUse } from './utils'

// Sem mocks: o construtor e o destroy() de verdade contra o DOM do jsdom, que é
// onde iframes e listeners se acumulavam ao remontar a tela numa SPA.

const CONTAINERS = Object.values(configurationsSDK.options.config.fields).map(
  (field) => field.container,
)

function mountContainers() {
  for (const container of CONTAINERS) {
    const element = document.createElement('div')
    element.id = container
    document.body.appendChild(element)
  }
}

const iframeCount = () => document.querySelectorAll('iframe').length

describe('destroy()', () => {
  let messageListeners: number

  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    clearContainersInUse()

    messageListeners = 0
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type: string, ...rest: any[]) => {
        if (type === 'message') messageListeners++
        return (add as any)(type, ...rest)
      },
    )
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type: string, ...rest: any[]) => {
        if (type === 'message') messageListeners--
        return (remove as any)(type, ...rest)
      },
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should leave a single set of iframes after destroying and recreating', () => {
    mountContainers()

    new MalgaTokenization(configurationsSDK).destroy()
    new MalgaTokenization(configurationsSDK)

    expect(iframeCount()).toBe(CONTAINERS.length)
    for (const container of CONTAINERS) {
      expect(
        document.getElementById(container)?.querySelectorAll('iframe'),
      ).toHaveLength(1)
    }
  })

  test('should keep iframes and listeners stable across repeated mounts', () => {
    mountContainers()

    for (let mount = 0; mount < 5; mount++) {
      const malgaTokenization = new MalgaTokenization(configurationsSDK)
      expect(iframeCount()).toBe(CONTAINERS.length)
      expect(messageListeners).toBe(1)

      malgaTokenization.destroy()
      expect(iframeCount()).toBe(0)
      expect(messageListeners).toBe(0)
    }
  })

  test('should remove the classes it put on the containers', () => {
    mountContainers()

    new MalgaTokenization(configurationsSDK).destroy()

    for (const container of CONTAINERS) {
      const element = document.getElementById(container)!
      for (const className of Object.values(CSSClasses)) {
        expect(element.classList.contains(className)).toBe(false)
      }
    }
  })

  test('should stop waiting for containers that were not in the DOM yet', async () => {
    new MalgaTokenization(configurationsSDK).destroy()

    mountContainers()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(iframeCount()).toBe(0)
  })

  test('should refuse a second live instance on the same containers before rendering anything', () => {
    mountContainers()
    new MalgaTokenization(configurationsSDK)

    expect(() => new MalgaTokenization(configurationsSDK)).toThrow(
      '"card-number"',
    )
    expect(iframeCount()).toBe(CONTAINERS.length)
    expect(messageListeners).toBe(1)
  })
})
