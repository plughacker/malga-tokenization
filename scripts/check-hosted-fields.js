// Trava do release: só publica o SDK se o hosted-fields de HOSTED_FIELDS_VERSION
// já estiver no ar em produção e em sandbox. Sem isso, o iframe de quem atualizar
// o SDK mostra a página 403 do S3/CloudFront (ADR 0001 do malga-hosted-fields).
//
// HOSTED_FIELDS_VERSION é sempre um major (x.0.0). Minor e patch do hosted-fields
// são republicados em /x.0.0/, então o build servido ali pode ser mais novo que a
// constante (/4.0.0/ servindo 4.2.0), mas nunca de outro major nem mais antigo.
//
// Uso: node scripts/check-hosted-fields.js [url-base ...]
// Sem argumentos, verifica produção e sandbox.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const DEFAULT_URLS = [
  'https://hosted-fields.malga.io',
  'https://hosted-fields-sandbox.malga.io',
]

function parse(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  return match ? match.slice(1).map(Number) : null
}

// O build servido em /<expected>/ atende o SDK se for do mesmo major e não for
// mais antigo que a constante.
export function isCompatibleVersion(served, expected) {
  const s = parse(served)
  const e = parse(expected)
  if (!s || !e || s[0] !== e[0]) return false

  for (let i = 1; i < 3; i++) {
    if (s[i] !== e[i]) return s[i] > e[i]
  }
  return true
}

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

  // O fallback da raiz também responde 200 com HTML: só a meta prova que é um
  // build da linha da versão.
  const html = await response.text()
  const meta = html.match(
    /<meta[^>]*name="hosted-fields-version"[^>]*content="([^"]*)"/,
  )
  if (!meta || !isCompatibleVersion(meta[1], version)) {
    return `${url}: hosted-fields-version ${meta ? `"${meta[1]}"` : 'ausente'}, esperado ${version} ou mais novo do mesmo major`
  }

  return null
}

async function main() {
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
}

// Importado pelos testes, não roda a verificação.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main()
}
