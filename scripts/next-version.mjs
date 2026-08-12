#!/usr/bin/env node
// Calcula a proxima versao a partir do package.json, sem alterar nada.
// Usado pelo job bump_plan para mostrar no resumo o que sera aplicado antes da aprovacao.
import { readFileSync } from 'node:fs'

const tipo = process.argv[2] ?? 'patch'
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const [major, minor, patch] = version.split('.').map(Number)

const proxima = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
  skip: version,
}[tipo]

if (!proxima) {
  console.error(`tipo de bump invalido: ${tipo} (use patch, minor, major ou skip)`)
  process.exit(1)
}

console.log(proxima)
