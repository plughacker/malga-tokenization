import { Malga } from 'src/common/malga'

export class AsyncTokenize {
  constructor(
    private readonly malga: Malga,
    // private readonly elements: MalgaFormElements,
  ) {}

  public handle() {
    return console.log('async')
    // const { form } = getFormElements(this.elements)
    // form?.addEventListener('submit', async (event) => {
    //   event.preventDefault()
    //   // const { holderName, number, expirationDate, cvv } = getFormValues(
    //   //   this.elements,
    //   // )
    //   const { tokenId } = await this.malga.tokenization({
    //     holderName,
    //     number,
    //     expirationDate,
    //     cvv,
    //   })
    //   removeFormElements(this.elements)
    //   const tokenIdElement = createFormElement('tokenId', tokenId)
    //   form?.appendChild(tokenIdElement)
    //   form?.submit()
    // })
  }
}
