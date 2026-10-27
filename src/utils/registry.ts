// Containers ocupados por instâncias vivas do MalgaTokenization. Duas
// instâncias com o mesmo container misturam os dados dos cartões, e a segunda
// ainda apaga a coleta da primeira no construtor: é sempre erro de
// configuração, e falha alto em vez de renderizar pela metade.
const containersInUse = new Map<string, object>()

export class ContainerInUseError extends Error {
  constructor(public readonly container: string) {
    super(
      `MalgaTokenization: the container "${container}" is already used by another instance. Call destroy() on that instance before creating a new one with the same container.`,
    )
    this.name = 'ContainerInUseError'
  }
}

export class DuplicatedContainerError extends Error {
  constructor(public readonly container: string) {
    super(
      `MalgaTokenization: the container "${container}" is configured for more than one field. Each field needs its own container.`,
    )
    this.name = 'DuplicatedContainerError'
  }
}

/**
 * Reserva os containers para `owner`. Recusa, antes de reservar qualquer um,
 * container repetido na própria configuração ou já ocupado por outra instância.
 */
export function claimContainers(owner: object, containers: string[]) {
  const seen = new Set<string>()

  for (const container of containers) {
    if (seen.has(container)) throw new DuplicatedContainerError(container)
    seen.add(container)

    const currentOwner = containersInUse.get(container)
    if (currentOwner && currentOwner !== owner) {
      throw new ContainerInUseError(container)
    }
  }

  for (const container of containers) containersInUse.set(container, owner)
}

/** Libera os containers reservados por `owner`. */
export function releaseContainers(owner: object) {
  for (const [container, currentOwner] of containersInUse) {
    if (currentOwner === owner) containersInUse.delete(container)
  }
}

/** Apenas para os testes: o módulo guarda estado entre casos. */
export function clearContainersInUse() {
  containersInUse.clear()
}
