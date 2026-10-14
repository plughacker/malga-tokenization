import { EventListener, Events } from './events'

describe('EventListener', () => {
  test('should stop calling a handler after remove', () => {
    const eventListener = new EventListener(window)
    const handler = vi.fn()

    eventListener.listener('message', handler)
    eventListener.remove('message', handler)
    window.dispatchEvent(new MessageEvent('message'))

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('Events', () => {
  test('should call registered handlers on emit', () => {
    const events = new Events()
    const handler = vi.fn()

    events.on('loading', handler)
    events.emit('loading', { isLoading: true })

    expect(handler).toHaveBeenCalledWith({ isLoading: true })
  })

  test('should stop calling a handler after unsubscribe', () => {
    const events = new Events()
    const removed = vi.fn()
    const kept = vi.fn()

    const off = events.on('loading', removed)
    events.on('loading', kept)
    off()
    events.emit('loading', { isLoading: true })

    expect(removed).not.toHaveBeenCalled()
    expect(kept).toHaveBeenCalledWith({ isLoading: true })
  })

  test('should ignore repeated unsubscribe calls', () => {
    const events = new Events()
    const first = vi.fn()
    const second = vi.fn()

    const off = events.on('loading', first)
    events.on('loading', second)
    off()
    off()
    events.emit('loading', { isLoading: false })

    expect(second).toHaveBeenCalledWith({ isLoading: false })
  })
})
