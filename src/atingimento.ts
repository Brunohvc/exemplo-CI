export type Meta = {
  realizado: number
  objetivo: number
}

/**
 * Percentual de atingimento da meta, arredondado em 2 casas.
 * Objetivo zerado nao tem atingimento possivel.
 */
export function percentualAtingimento({ realizado, objetivo }: Meta): number {
  if (objetivo <= 0) {
    throw new Error('objetivo da meta deve ser maior que zero')
  }

  return Math.round((realizado / objetivo) * 10000) / 100
}

export function metaAtingida(meta: Meta): boolean {
  return percentualAtingimento(meta) >= 100
}
