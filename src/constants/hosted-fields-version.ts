/**
 * Versão do hosted-fields que este SDK carrega.
 *
 * O iframe é publicado em caminhos imutáveis, um por versão. Cada release do
 * SDK aponta para a versão contra a qual foi testado, e um caminho publicado
 * nunca recebe mudança de contrato — é isso que impede um deploy do iframe de
 * quebrar integrações que já estão no ar.
 *
 * Só troque este valor junto com a verificação de que o SDK funciona contra
 * aquela versão. É a única linha que decide qual iframe o merchant recebe.
 */
export const HOSTED_FIELDS_VERSION = '2.0.0'
