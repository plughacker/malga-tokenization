export function camelToKebabCase(camelCaseString: string) {
  return camelCaseString.replace(/([A-Z])/g, '-$1').toLowerCase()
}
