import { Malga } from 'src/common/malga'

export class Tokenize {
  constructor(private readonly malga: Malga) {}

  public async handle() {
    // const { holderName, number, expirationDate, cvv } = getFormValues(
    //   this.elements,
    // )

    return console.log('entrou nessa funcao do tokeniza')
    // return this.malga.tokenization({
    //   holderName,
    //   number,
    //   expirationDate,
    //   cvv,
    // })
  }
}
