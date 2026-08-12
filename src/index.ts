import { metaAtingida, percentualAtingimento } from './atingimento'
import { getPackageInfo } from './version'

const { name, version } = getPackageInfo()
const meta = { realizado: 87, objetivo: 100 }

console.log(`[${name}] v${version} iniciado`)
console.log(
  `[${name}] atingimento: ${percentualAtingimento(meta)}% | meta atingida: ${metaAtingida(meta)}`,
)
