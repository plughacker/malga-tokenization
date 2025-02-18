// // import {
// //   formElementsMock,
// //   formValuesMock,
// //   handleFormMock,
// // } from './common-configurations'
// import { CSSClasses } from '../../src/enums'

// export function generateIframe(type: string) {
//   const iframe = document.createElement('iframe')

//   iframe.setAttribute('id', type)
//   iframe.setAttribute('name', type)
//   iframe.setAttribute('src', 'https://develop.d3krxmg1839vaa.amplifyapp.com/')
//   iframe.setAttribute('width', '100%')
//   iframe.setAttribute('height', '100%')
//   iframe.setAttribute('frameborder', '0')

//   const parentNode = document.createElement('div')
//   document.body.appendChild(parentNode)

//   parentNode.appendChild(iframe)
//   parentNode.setAttribute('id', type)
//   parentNode.classList.add(CSSClasses.Default)

//   return iframe
// }

// export function generateForm(onSubmit?: any) {
//   const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
//     handleFormMock()

//   form.setAttribute(formElementsMock.form, '')
//   form.onsubmit = onSubmit
//   form.id = 'form'
//   form.method = 'POST'
//   form.action = '/test'

//   holderNameInput.setAttribute(formElementsMock.holderName, '')
//   numberInput.setAttribute(formElementsMock.number, '')
//   cvvInput.setAttribute(formElementsMock.cvv, '')
//   expirationDateInput.setAttribute(formElementsMock.expirationDate, '')

//   document.body.appendChild(form)
//   form.appendChild(holderNameInput)
//   form.appendChild(numberInput)
//   form.appendChild(expirationDateInput)
//   form.appendChild(cvvInput)

//   const inputs = document.querySelectorAll('input')
//   inputs[0].value = formValuesMock.holderName
//   inputs[1].value = formValuesMock.number
//   inputs[2].value = formValuesMock.expirationDate
//   inputs[3].value = formValuesMock.cvv
// }

// export function generateFormEmptyValues(onSubmit?: any) {
//   const { form, holderNameInput, cvvInput, expirationDateInput, numberInput } =
//     handleFormMock()

//   form.setAttribute(formElementsMock.form, '')
//   form.onsubmit = onSubmit
//   form.id = 'form'
//   form.method = 'POST'
//   form.action = '/test'

//   holderNameInput.setAttribute(formElementsMock.holderName, '')
//   numberInput.setAttribute(formElementsMock.number, '')
//   cvvInput.setAttribute(formElementsMock.cvv, '')
//   expirationDateInput.setAttribute(formElementsMock.expirationDate, '')

//   document.body.appendChild(form)
//   form.appendChild(holderNameInput)
//   form.appendChild(numberInput)
//   form.appendChild(expirationDateInput)
//   form.appendChild(cvvInput)
// }
