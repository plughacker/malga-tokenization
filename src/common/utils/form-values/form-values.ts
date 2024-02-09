import { MalgaFormElements } from 'src/common/interfaces'

import { getFormElements } from '../form-elements'

export function getFormValues(elements: MalgaFormElements) {
  const formElements = getFormElements(elements)

  return {
    holderName: formElements.holderName?.value,
    cvv: formElements.cvv?.value,
    expirationDate: formElements.expirationDate?.value,
    number: formElements.number?.value,
  }
}
