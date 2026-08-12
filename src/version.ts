import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type PackageJson = {
  name: string
  version: string
}

/**
 * Le nome e versao do package.json em runtime.
 * Funciona tanto rodando de src (ts-node) quanto de dist (build).
 */
export function getPackageInfo(): PackageJson {
  const path = join(__dirname, '..', 'package.json')
  const { name, version } = JSON.parse(readFileSync(path, 'utf8')) as PackageJson

  return { name, version }
}
