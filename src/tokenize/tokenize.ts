import type { MalgaFormElements } from 'src/common/interfaces'
import { Malga } from 'src/common/malga'
import { getFormValues } from 'src/common/utils'

export class Tokenize {
  constructor(
    private readonly malga: Malga,
    private readonly elements: MalgaFormElements,
  ) {}

  public async handle() {
    const { holderName, number, expirationDate, cvv } = getFormValues(
      this.elements,
    )

    return this.malga.tokenization({
      holderName,
      number,
      expirationDate,
      cvv,
    })
  }
}
