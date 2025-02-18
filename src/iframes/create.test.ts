import { CSSClasses } from 'src/enums'
import { create } from './create'
import { camelToKebabCase } from '../utils/parsedString'

describe('create', () => {
  test('should be possible to create an iframe with field cardNumber', () => {
    const field = 'cardNumber'
    const type = camelToKebabCase(field)
    const parentNode = document.createElement('div')
    parentNode.id = 'card-number'
    document.body.appendChild(parentNode)

    create(type, {
      container: '#card-number',
      type: 'text',
    })

    const iframe = document.querySelector(`iframe[name=${type}]`)

    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    )
    expect(iframe).toHaveAttribute('name', type)
    expect(parentNode.classList.contains(CSSClasses.Default)).toBe(true)
    expect(parentNode.getAttribute('id')).toBe(type)
  })

  test('should be possible to create an iframe with field cardHolderName', () => {
    const field = 'cardHolderName'
    const type = camelToKebabCase(field)

    const parentNode = document.createElement('div')
    parentNode.id = type
    document.body.appendChild(parentNode)

    create(type, {
      container: `#${type}`,
      type: 'text',
    })

    const iframe = document.querySelector(`iframe[name=${type}]`)

    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    )
    expect(iframe).toHaveAttribute('name', type)
    expect(parentNode.classList.contains(CSSClasses.Default)).toBe(true)
    expect(parentNode.getAttribute('id')).toBe(type)
  })

  test('should be possible to create an iframe with field cardExpirationDate', () => {
    const field = 'cardExpirationDate'
    const type = camelToKebabCase(field)

    const parentNode = document.createElement('div')
    parentNode.id = type
    document.body.appendChild(parentNode)

    create(type, {
      container: `#${type}`,
      type: 'text',
    })

    const iframe = document.querySelector(`iframe[name=${type}]`)

    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    )
    expect(iframe).toHaveAttribute('name', type)
    expect(parentNode.classList.contains(CSSClasses.Default)).toBe(true)
    expect(parentNode.getAttribute('id')).toBe(type)
  })

  test('should be possible to create an iframe with field cardCvv', () => {
    const field = 'cardCvv'
    const type = camelToKebabCase(field)

    const parentNode = document.createElement('div')
    parentNode.id = type
    document.body.appendChild(parentNode)

    create(type, {
      container: `#${type}`,
      type: 'text',
    })

    const iframe = document.querySelector(`iframe[name=${type}]`)

    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://develop.d3krxmg1839vaa.amplifyapp.com/',
    )
    expect(iframe).toHaveAttribute('name', type)
    expect(parentNode.classList.contains(CSSClasses.Default)).toBe(true)
    expect(parentNode.getAttribute('id')).toBe(type)
  })
})
