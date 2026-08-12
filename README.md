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
| `version_bump` | push/dispatch em `main` | `npm version <tipo>`, commit `chore(release): vX.Y.Z [skip ci]`, tag e push |
| `ci_docker_release` | push/dispatch em `main` | `docker build` no commit já versionado |
| `cd_prd` | push/dispatch em `main` | log do deploy em `prd` (env `prd`) |

O bump vem do input `bump` do `workflow_dispatch`. Em **push direto na `main`** (sem dispatch) o default é `patch`.
O commit de release leva `[skip ci]` para não disparar o workflow em loop.

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

### 3. Produção com bump escolhido (patch / minor / major / skip)

Actions → **Standard** → *Run workflow* → branch `main` → escolha o incremento → *Run*.

Esperado: `ci` → `version_bump` (ex.: `1.0.0` → `1.1.0` no minor) → `ci_docker_release` → `cd_prd` logando
`🚀 deploy concluido: exemplo-ci v1.1.0 -> prd`. No repo aparece a tag `v1.1.0` e o commit `chore(release)`.

Com `skip`, nenhuma versão nova é criada e o deploy loga a versão atual.

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
