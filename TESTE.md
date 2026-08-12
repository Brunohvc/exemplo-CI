# Teste de esteira

Arquivo criado apenas para validar o fluxo de pull request do workflow `Standard`:
em PR para `homolog` ou `main` rodam somente os jobs `ci` e `ci_docker` — nenhum deploy.

Segunda rodada, com o gate de bump por environment já ativo: o PR continua sem abrir pendência de
aprovação, porque os jobs `bump_*` só existem em push na `main`.
