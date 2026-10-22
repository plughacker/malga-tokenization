import {
  ContainerInUseError,
  DuplicatedContainerError,
  claimContainers,
  clearContainersInUse,
  releaseContainers,
} from './registry'

describe('container registry', () => {
  beforeEach(() => {
    clearContainersInUse()
  })

  test('should let different owners claim different containers', () => {
    expect(() => {
      claimContainers({}, ['card-number', 'card-cvv'])
      claimContainers({}, ['card-number-2', 'card-cvv-2'])
    }).not.toThrow()
  })

  test('should refuse a container owned by another live owner, naming it', () => {
    claimContainers({}, ['card-number', 'card-cvv'])

    let error: unknown
    try {
      claimContainers({}, ['card-number-2', 'card-cvv'])
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(ContainerInUseError)
    expect((error as ContainerInUseError).container).toBe('card-cvv')
    expect((error as Error).message).toContain('"card-cvv"')
  })

  test('should refuse the same container for two fields of one owner', () => {
    expect(() => claimContainers({}, ['numero', 'cvv', 'numero'])).toThrow(
      DuplicatedContainerError,
    )
  })

  test('should claim nothing when it refuses', () => {
    const first = {}
    claimContainers(first, ['card-cvv'])

    expect(() => claimContainers({}, ['card-number', 'card-cvv'])).toThrow()
    expect(() => claimContainers({}, ['card-number'])).not.toThrow()
  })

  test('should free the containers of an owner on release', () => {
    const first = {}
    claimContainers(first, ['card-number'])
    releaseContainers(first)

    expect(() => claimContainers({}, ['card-number'])).not.toThrow()
  })

  test('should let the same owner claim its own containers again', () => {
    const owner = {}
    claimContainers(owner, ['card-number'])

    expect(() => claimContainers(owner, ['card-number'])).not.toThrow()
  })
})
