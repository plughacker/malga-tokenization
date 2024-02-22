import { MalgaFormElements } from 'src/common/interfaces'

export function getFormElements(formElements: MalgaFormElements) {
  return {
    form: document.querySelector<HTMLFormElement>(`[${formElements.form}]`),
    holderName: document.querySelector<HTMLInputElement>(
      `[${formElements.holderName}]`,
    ),
    cvv: document.querySelector<HTMLInputElement>(`[${formElements.cvv}]`),
    expirationDate: document.querySelector<HTMLInputElement>(
      `[${formElements.expirationDate}]`,
    ),
    number: document.querySelector<HTMLInputElement>(
      `[${formElements.number}]`,
    ),
  }
}

export function removeFormElements(formElements: MalgaFormElements) {
  const elements = getFormElements(formElements)

  elements.holderName?.remove()
  elements.number?.remove()
  elements.expirationDate?.remove()
  elements.cvv?.remove()
}

export function createFormElement(name: string, value: string) {
  const field = document.createElement('input')
  field.type = 'hidden'
  field.name = name
  field.setAttribute('tokenId', '')
  field.value = value

  return field
}
