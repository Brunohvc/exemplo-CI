# exemplo-CI

Projeto mínimo (Node + TypeScript) para testar o fluxo de **CI/CD igual ao dos repos `franq-pmf-*-metas`**:
CI com lint/test/build, deploy em `homolog`, bump de versão manual (`patch`/`minor`/`major`/`skip`) e deploy em `prd`.

O único efeito do "deploy" aqui é **logar a versão publicada** — nada é provisionado.

## Stack

| item | escolha |
| --- | --- |
| runtime | Node 24 (`.nvmrc`) |
| linguagem | TypeScript (`tsc` → `dist/`) |
| package manager | yarn 1.22 |
| lint/format | Biome |
| testes | Jest + ts-jest (`src/atingimento.spec.ts`, `src/version.spec.ts`) |
| commits | commitlint (conventional) + husky + commitizen |

```bash
yarn install && yarn lint && yarn test && yarn build && yarn start
```

## Branches

- `homolog` → esteira de homologação (CI + Docker + deploy hml)
- `main` → esteira de produção (CI + bump de versão + Docker release + deploy prd)

## Workflow `Standard` (`.github/workflows/standard.yaml`)

| job | quando roda | o que faz |
| --- | --- | --- |
| `ci` | push/PR em `main` e `homolog` | install, lint, test, build |
| `ci_docker` | tudo que **não** é `main` | `docker build` da imagem |
| `cd_hml` | push em `homolog` | log do deploy em `hml` (env `hml`) |
| `bump_plan` | push/dispatch em `main` | escreve no resumo a versão atual e qual versão cada incremento gera |
| `bump_patch` / `bump_minor` / `bump_major` | push/dispatch em `main` | jobs de aprovação, um por environment (`bump-patch`, `bump-minor`, `bump-major`) |
| `version_bump` | após a aprovação | `npm version <aprovado>`, commit `chore(release): vX.Y.Z [skip ci]`, tag e push |
| `ci_docker_release` | após o bump | `docker build` no commit já versionado |
| `cd_prd` | após o bump | log do deploy em `prd` (env `prd`) |

O commit de release leva `[skip ci]` para não disparar o workflow em loop.

### Escolha do incremento no diálogo de aprovação

Todo push na `main` abre **três pendências de deployment** — `bump-patch`, `bump-minor` e `bump-major`,
cada uma com *required reviewer*. Em **Review deployments** você:

1. marca o environment do incremento desejado → **Approve and deploy**;
2. marca os outros dois → **Reject** (libera o `version_bump`, que roda com o incremento aprovado).

Os jobs de aprovação têm `continue-on-error: true`, então os rejeitados não derrubam o run. Se você
rejeitar os três, nada é versionado e nenhum deploy acontece. **Aprovar mais de um incremento faz o
`version_bump` falhar** — o diálogo do GitHub permite marcar vários, então a validação é no job. O resumo
do `bump_plan` mostra, antes da aprovação, qual versão cada environment produz — ex.: `bump-minor` → `1.1.0`.

O `version_bump` identifica o incremento pelo **output** do job de aprovação, não pelo `result`: com
`continue-on-error: true` o `needs.<job>.result` vem `success` mesmo quando a aprovação foi rejeitada.
Job rejeitado não executa step nenhum, então o output fica vazio — esse é o sinal confiável.

O `version_bump` só é agendado quando os três jobs de bump chegam a um estado final — por isso aprovar um
não basta, os outros dois precisam ser rejeitados no diálogo. São dois envios: *Approve and deploy* em um,
*Reject* nos outros dois.

Pelo **Run workflow** o comportamento é mais curto: o input já define o incremento, então **só aquele
environment** é aberto para aprovação (e `skip` dispensa aprovação, porque não versiona).

> O GitHub não permite input custom no diálogo de aprovação — ele só tem checkbox por environment,
> Approve e Reject. Um environment por incremento é o que transforma esse checkbox na seleção do bump.
> *Required reviewers* em repo **privado** exige GitHub Pro/Team/Enterprise; em repo público é gratuito
> (motivo pelo qual este repo é público).

## Como testar cada fluxo

### 1. PR (só CI, nenhum deploy)

```bash
git checkout -b feat/minha-mudanca && git commit --allow-empty -m "feat: valida esteira de PR" && git push -u origin HEAD
```

Abra o PR para `homolog` ou `main`: rodam apenas `ci` e `ci_docker`.

### 2. Homolog

```bash
git checkout -b homolog && git push -u origin homolog
```

Esperado: `ci` + `ci_docker` → `cd_hml` logando `🚀 deploy concluido: exemplo-ci v1.0.0 -> hml`.
A versão **não muda** em homolog — é a mesma do `package.json`.

### 3. Produção escolhendo o incremento na aprovação

Qualquer push/merge na `main`. O run para com as três pendências; abra **Review deployments**, aprove
`bump-minor` (por exemplo) e rejeite `bump-patch` e `bump-major`.

Esperado: `ci` → `bump_plan` → **waiting for review** → `version_bump` (`1.0.2` → `1.1.0`) →
`ci_docker_release` → `cd_prd` logando `🚀 deploy concluido: exemplo-ci v1.1.0 -> prd`. No repo aparece a
tag `v1.1.0` e o commit `chore(release)`.

### 3b. Produção pelo Run workflow

Actions → **Standard** → *Run workflow* → branch `main` → escolha o incremento → *Run*. Só o environment
correspondente pede aprovação. Com `skip` não há aprovação nem versão nova — o deploy loga a versão atual.

> Depois do bump o `package.json` remoto muda — rode `git pull` antes do próximo push na `main`.

### 4. Produção via push direto na main (bump implícito = patch)

```bash
git checkout main && git commit --allow-empty -m "fix: valida esteira de prd" && git push
```

## Diferenças em relação aos repos `-metas`

Mesma estrutura de jobs, nomes, `if`s, `concurrency` e o mesmo passo de bump. O que foi trocado por não existir fora do GB:

| nos `-metas` | aqui |
| --- | --- |
| `runs-on: [vs-franqueado-arm64]` | `runs-on: ubuntu-latest` |
| `grupoboticario/actions-ci-alquimia` (build + push ECR) | `docker build` local, sem push |
| `grupoboticario/actions-cd-alquimia` (infra + app) | `node scripts/deploy.mjs <env>` (só loga a versão) |
| `grupoboticario/actions-ci-sonarcloud` | removido |
| `devsecops.yml` (workflow reutilizável interno) | removido |
| `secrets.GHA_PACKAGES` | `secrets.GITHUB_TOKEN` |
| golden image da ECR no Dockerfile | `node:24-alpine` público |
