#!/usr/bin/env node
// "Deploy" simulado: o unico efeito e logar qual versao foi publicada e em qual ambiente.
// Usado pelos jobs cd_hml e cd_prd do workflow Standard.
import { appendFileSync, readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const env = process.argv[2] ?? process.env.DEPLOY_ENV ?? 'local'
const sha = (process.env.GITHUB_SHA ?? 'local').slice(0, 7)
const ref = process.env.GITHUB_REF_NAME ?? 'local'
const runNumber = process.env.GITHUB_RUN_NUMBER ?? '0'

const linhas = [
  `🚀 deploy concluido: ${pkg.name} v${pkg.version} -> ${env}`,
  `   versao..: ${pkg.version}`,
  `   ambiente: ${env}`,
  `   branch..: ${ref}`,
  `   commit..: ${sha}`,
  `   run.....: #${runNumber}`,
]

for (const linha of linhas) {
  console.log(linha)
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `## 🚀 Deploy ${env}`,
      '',
      `| campo | valor |`,
      `| --- | --- |`,
      `| versao | \`${pkg.version}\` |`,
      `| ambiente | \`${env}\` |`,
      `| branch | \`${ref}\` |`,
      `| commit | \`${sha}\` |`,
      '',
    ].join('\n'),
  )
}
