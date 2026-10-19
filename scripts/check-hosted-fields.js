// Trava do release: só publica o SDK se o hosted-fields de HOSTED_FIELDS_VERSION
// já estiver no ar em produção e em sandbox. Sem isso, o iframe de quem atualizar
// o SDK mostra a página 403 do S3/CloudFront (ADR 0001 do malga-hosted-fields).
//
// Uso: node scripts/check-hosted-fields.js [url-base ...]
// Sem argumentos, verifica produção e sandbox.
import { readFileSync } from 'node:fs'

const DEFAULT_URLS = [
  'https://hosted-fields.malga.io',
  'https://hosted-fields-sandbox.malga.io',
]

function readVersion() {
  const source = readFileSync(
    new URL('../src/constants/version.ts', import.meta.url),
    'utf8',
  )
  const match = source.match(/HOSTED_FIELDS_VERSION\s*=\s*'([^']+)'/)

  if (!match) {
    throw new Error(
      'HOSTED_FIELDS_VERSION não encontrado em src/constants/version.ts',
    )
  }

  return match[1]
}

async function check(baseUrl, version) {
  const url = `${baseUrl}/${version}/index.html`

  let response
  try {
    response = await fetch(url, { cache: 'no-store' })
  } catch (error) {
    return `${url}: falha de rede (${error.message})`
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (response.status !== 200 || !contentType.includes('text/html')) {
    return `${url}: ${response.status} ${contentType || 'sem content-type'}`
  }

  // O fallback da raiz também responde 200 com HTML: só a meta prova que é o
  // build da versão.
  const html = await response.text()
  const meta = html.match(
    /<meta[^>]*name="hosted-fields-version"[^>]*content="([^"]*)"/,
  )
  if (!meta || meta[1] !== version) {
    return `${url}: hosted-fields-version ${meta ? `"${meta[1]}"` : 'ausente'}, esperado "${version}"`
  }

  return null
}

const version = readVersion()
const urls = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_URLS
const failures = (
  await Promise.all(urls.map((url) => check(url, version)))
).filter(Boolean)

if (failures.length > 0) {
  console.error(
    `O hosted-fields ${version} não está publicado. Faça o deploy dele antes de publicar o SDK:`,
  )
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exitCode = 1
} else {
  console.log(`hosted-fields ${version} no ar em: ${urls.join(', ')}`)
}
